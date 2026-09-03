// rewrite-question-ai — 根据创作者输入的自然语言 prompt，用 AI 改写单道题目
// 复用与 generate-course-ai 相同的多模型 fallback 机制（智谱GLM/Kimi/DeepSeek/Groq）
// 输入: { question, userPrompt, courseTitle, courseCategory }
// 输出: { ok:true, question:{...同类型题目...}, provider } 或 { ok:false, msg }

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PROVIDERS = {
  zhipu: {
    label: "智谱 GLM (glm-4-flash)",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    model: "glm-4-flash",
    keyEnv: "ZHIPU_API_KEY",
  },
  moonshot: {
    label: "月之暗面 Kimi (moonshot-v1-8k)",
    baseUrl: "https://api.moonshot.cn/v1",
    model: "moonshot-v1-8k",
    keyEnv: "MOONSHOT_API_KEY",
  },
  deepseek: {
    label: "DeepSeek (deepseek-chat)",
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
    keyEnv: "DEEPSEEK_API_KEY",
  },
  groq: {
    label: "Groq (llama-3.1-8b-instant)",
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama-3.1-8b-instant",
    keyEnv: "GROQ_API_KEY",
  },
};

function getProviderOrder() {
  const raw = Deno.env.get("AI_PROVIDER_ORDER") || "zhipu,moonshot,deepseek,groq";
  return raw.split(",").map((s) => s.trim()).filter((s) => PROVIDERS[s]);
}

const TYPE_LABEL = { choice: "选择题", blank: "填空题", match: "匹配题" };

function buildPrompt(question, userPrompt, courseTitle, courseCategory) {
  const typeLabel = TYPE_LABEL[question.type] || question.type;
  return `你是教学题目设计专家。下面是课程《${courseTitle || "未命名课程"}》（分类：${courseCategory || "通用"}）中的一道${typeLabel}题目。

原题目（JSON）：
${JSON.stringify({ type: question.type, stem: question.stem, options: question.options, answer: question.answer, pairs: question.pairs })}

创作者的修改要求："${userPrompt}"

请严格按创作者的要求改写这道题目，但必须遵守：
1. 题目类型保持不变，仍为 "${question.type}"（${typeLabel}），除非创作者明确要求更换题型。
2. 输出结构必须与原题目一致：
   - choice（选择题）: {"type":"choice","stem":"题干","options":["选项1","选项2","选项3","选项4"],"answer":"与options中某一项完全一致的正确答案"}
   - blank（填空题）: {"type":"blank","stem":"题干，用____表示空白处","answer":"正确答案词语"}
   - match（匹配题）: {"type":"match","stem":"说明文字","pairs":[{"term":"术语","definition":"释义"}, ...至少2对]}
3. 只输出严格合法 JSON（题目对象本身，不要包一层外壳，不要解释文字，不要 markdown 代码块标记）。

请直接输出JSON：`;
}

function extractJson(raw) {
  let s = raw.trim();
  s = s.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("AI 返回内容不是合法 JSON");
  return JSON.parse(s.slice(start, end + 1));
}

function normalizeQuestion(raw, expectedType) {
  const type = raw.type || expectedType;
  if (type === "choice") {
    const options = (raw.options || []).map(String).filter(Boolean);
    let answer = String(raw.answer || "");
    if (!options.includes(answer) && options.length) answer = options[0];
    if (options.length < 2) throw new Error("AI 返回的选择题选项不足");
    return { type: "choice", stem: String(raw.stem || ""), options, answer };
  }
  if (type === "blank") {
    if (!raw.stem || !raw.answer) throw new Error("AI 返回的填空题缺少题干或答案");
    return { type: "blank", stem: String(raw.stem), answer: String(raw.answer) };
  }
  if (type === "match") {
    const pairs = (raw.pairs || [])
      .map((p) => ({ term: String(p.term || ""), definition: String(p.definition || "") }))
      .filter((p) => p.term && p.definition);
    if (pairs.length < 2) throw new Error("AI 返回的匹配题配对不足");
    return { type: "match", stem: String(raw.stem || "请将左侧术语与右侧释义正确匹配"), pairs };
  }
  throw new Error("未知题目类型：" + type);
}

async function callProvider(providerKey, prompt) {
  const cfg = PROVIDERS[providerKey];
  const apiKey = Deno.env.get(cfg.keyEnv);
  if (!apiKey) return { ok: false, skip: true };

  const resp = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: cfg.model,
      messages: [
        { role: "system", content: "你是严谨的教学题目设计助手，只输出合法 JSON。" },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    return { ok: false, skip: false, msg: `${cfg.label} 调用失败(${resp.status})：${errText.slice(0, 150)}` };
  }
  const data = await resp.json();
  const content = data.choices?.[0]?.message?.content || "";
  const parsed = extractJson(content);
  return { ok: true, parsed, providerLabel: cfg.label };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { question, userPrompt, courseTitle, courseCategory } = await req.json();
    if (!question || !question.type) {
      return new Response(JSON.stringify({ ok: false, msg: "缺少原题目数据" }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }
    if (!userPrompt || !userPrompt.trim()) {
      return new Response(JSON.stringify({ ok: false, msg: "请填写修改要求" }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    const order = getProviderOrder();
    const prompt = buildPrompt(question, userPrompt.trim(), courseTitle, courseCategory);
    const errors = [];
    let success = null;

    for (const providerKey of order) {
      try {
        const r = await callProvider(providerKey, prompt);
        if (r.skip) continue;
        if (r.ok) { success = r; break; }
        errors.push(r.msg);
      } catch (err) {
        errors.push(`${PROVIDERS[providerKey].label} 出错：${err.message || err}`);
      }
    }

    if (!success) {
      const msg = errors.length
        ? "所有已配置的 AI 模型均调用失败：" + errors.join("；")
        : "尚未配置任何 AI 模型密钥，请先在后台设置对应 API Key";
      return new Response(JSON.stringify({ ok: false, msg }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    let newQuestion;
    try {
      newQuestion = normalizeQuestion(success.parsed, question.type);
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, msg: `${success.providerLabel} 返回的题目格式不合法：${err.message}` }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true, question: newQuestion, provider: success.providerLabel }), { headers: { ...CORS, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, msg: "AI 改写出错：" + (err && err.message || String(err)) }), { headers: { ...CORS, "Content-Type": "application/json" } });
  }
});
