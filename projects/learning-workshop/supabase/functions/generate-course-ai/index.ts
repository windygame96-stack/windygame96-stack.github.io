// generate-course-ai — 调用 AI API（支持多家免费/低价模型，自动按优先级 fallback）生成分难度课程题目
// 支持：智谱 GLM（glm-4-flash，长期免费）、月之暗面 Kimi（moonshot）、DeepSeek、Groq（Llama，国际免费）
// 输入: { title, category, text, ownerUsername }
// 输出: { ok:true, course:{...}, provider } 与规则算法 Generator.generateCourse 相同结构，或 { ok:false, msg }

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
  return raw.split(",").map(s => s.trim()).filter(s => PROVIDERS[s]);
}

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function buildPrompt(text, title, category) {
  return `你是一个教学题目设计专家。请严格根据下面的教材内容，为课程《${title}》（分类：${category || "通用"}）生成 easy / medium / hard 三个难度的互动题目。

## 难度区分标准（必须严格遵守）
- easy（初级）：直接事实/术语识记。题干应短小，答案几乎能在原文中直接找到原词或原句，不需要推理。例如：某术语的定义是什么、某概念属于哪一类。
- medium（中级）：理解概念之间的关系，需要比较、归纳或简单应用。干扰项与正确答案应来自同一段落的相近概念，需要真正理解才能区分，不能仅凭关键词匹配。
- hard（高级）：综合分析或场景应用。题干应给出具体情境、多条件组合，或要求判断边界条件/原因/最佳方案；需要结合多个知识点进行推理，不能是简单记忆。

## 输出格式要求
1. 每个难度生成 4-6 道题，三个难度合计 12-18 道。题型混合覆盖 choice（选择题）、blank（填空题）、match（匹配题）三种。
2. 只输出严格合法 JSON，不要任何解释文字、不要 markdown 代码块标记。
3. JSON 结构如下：
{
  "easy": [ ...题目对象... ],
  "medium": [ ...题目对象... ],
  "hard": [ ...题目对象... ]
}
4. 题目对象格式：
- 选择题: {"type":"choice","stem":"题干","options":["选项1","选项2","选项3","选项4"],"answer":"与options中某一项完全一致的正确答案"}
- 填空题: {"type":"blank","stem":"题干，用____表示空白处","answer":"正确答案词语"}
- 匹配题: {"type":"match","stem":"请将左侧术语与右侧释义正确匹配","pairs":[{"term":"术语1","definition":"释义1"},{"term":"术语2","definition":"释义2"},{"term":"术语3","definition":"释义3"},{"term":"术语4","definition":"释义4"}]}
5. 难度递进要明显：easy 题目换到 medium 后，学习者不能仅靠原文关键词直接命中；hard 题目必须要求跨句/跨段综合，或给出一个需要判断的具体场景。
6. 所有内容必须紧密围绕下面的教材文本，不要编造教材未提及的知识、术语或场景。
7. 同一难度内的题目不要重复考查同一个孤立知识点，尽量覆盖教材的不同方面。

教材内容：
"""
${text.slice(0, 4000)}
"""

请直接输出 JSON：`;
}

function normalizeQuestions(list) {
  if (!Array.isArray(list)) return [];
  return list.map(q => {
    if (q.type === "choice") {
      return { id: uid("q"), type: "choice", stem: String(q.stem || ""), options: (q.options || []).map(String), answer: String(q.answer || "") };
    }
    if (q.type === "blank") {
      return { id: uid("q"), type: "blank", stem: String(q.stem || ""), answer: String(q.answer || "") };
    }
    if (q.type === "match") {
      return {
        id: uid("q"), type: "match", stem: String(q.stem || "请将左侧术语与右侧释义正确匹配"),
        pairs: (q.pairs || []).map(p => ({ term: String(p.term || ""), definition: String(p.definition || "") })).filter(p => p.term && p.definition),
      };
    }
    return null;
  }).filter(Boolean).filter(q => q.type !== "match" || q.pairs.length >= 2);
}

function extractJson(raw) {
  let s = raw.trim();
  s = s.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("AI 返回内容不是合法 JSON");
  return JSON.parse(s.slice(start, end + 1));
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
    const { title, category, text, ownerUsername } = await req.json();
    if (!text || text.trim().length < 30) {
      return new Response(JSON.stringify({ ok: false, msg: "教材内容过短，无法生成" }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    const order = getProviderOrder();
    const prompt = buildPrompt(text, title, category);
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
        : "尚未配置任何 AI 模型密钥（支持智谱GLM/Kimi/DeepSeek/Groq），请先在后台设置对应 API Key";
      return new Response(JSON.stringify({ ok: false, msg }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    const levels = {
      easy: normalizeQuestions(success.parsed.easy),
      medium: normalizeQuestions(success.parsed.medium),
      hard: normalizeQuestions(success.parsed.hard),
    };
    const totalQ = levels.easy.length + levels.medium.length + levels.hard.length;
    if (totalQ === 0) {
      return new Response(JSON.stringify({ ok: false, msg: `${success.providerLabel} 未能生成有效题目` }), { headers: { ...CORS, "Content-Type": "application/json" } });
    }

    const course = {
      id: uid("course"),
      title: title || "未命名课程",
      category: category || "通用",
      ownerUsername,
      createdAt: Date.now(),
      levels,
    };

    return new Response(JSON.stringify({ ok: true, course, provider: success.providerLabel }), { headers: { ...CORS, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, msg: "AI 生成出错：" + (err && err.message || String(err)) }), { headers: { ...CORS, "Content-Type": "application/json" } });
  }
});
