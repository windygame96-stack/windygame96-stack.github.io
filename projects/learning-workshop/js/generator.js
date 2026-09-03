/* generator.js — 规则算法：将教材文本转换为分难度的互动题目（选择 / 填空 / 匹配） */

export const Generator = (() => {
  const STOPWORDS = new Set([
    "我们",
    "你们",
    "他们",
    "这个",
    "那个",
    "可以",
    "需要",
    "一般",
    "通常",
    "以及",
    "因为",
    "所以",
    "但是",
    "不过",
    "虽然",
    "如果",
    "这样",
    "那样",
    "然后",
    "已经",
    "应该",
    "进行",
    "使用",
    "以及",
    "关于",
    "对于",
    "而且",
    "并且",
    "或者",
    "以及",
    "这些",
    "那些",
    "其中",
    "其实",
    "就是",
    "非常",
    "一些",
    "有些",
    "什么",
    "怎么",
    "如何",
    "为什么",
    "什么是",
    "以下",
    "下面",
    "上面",
    "包括",
  ]);

  function splitSentences(text) {
    return text
      .split(/[\n\r]+/)
      .flatMap((line) => line.split(/(?<=[。！？.!?])/))
      .map((s) => s.trim())
      .filter((s) => s.length >= 6 && s.length <= 120);
  }

  // 尝试从句子中抽取 term/definition 结构化模式
  function extractPair(sentence) {
    let m;
    // 术语：解释 / 术语:解释
    m = sentence.match(/^([^：:，,。]{1,12})[：:]\s*(.{2,})$/);
    if (m) return { term: m[1].trim(), definition: m[2].trim() };
    // 术语是/为/称为/指的是/就是 解释
    m = sentence.match(
      /^([^是为称即指就]{1,10})(?:指的是|就是|称为|是|为|即)(.{2,})$/,
    );
    if (m) return { term: m[1].trim(), definition: (m[2] || "").trim() };
    // 术语——解释 / 术语-解释
    m = sentence.match(/^([^—\-]{1,12})[—\-]\s*(.{2,})$/);
    if (m) return { term: m[1].trim(), definition: m[2].trim() };
    return null;
  }

  // 中文分词场景下没有空格，直接用固定长度切片会切碎词语。
  // 这里改用常见虚词/功能词作为切分点，取切分后第一个合理长度的片段作为术语，
  // 更贴近句子主干的"主语/术语"部分。
  const PARTICLE_SPLIT =
    /的|地|得|了|着|过|指的是|就是|称为|是|为|即|来自|通常|而且|并且|以及|如果|因为|所以|然后|已经|其中|包括|主要|首先|同时|应该|可以|需要|将|把|被|等等|一般|会给|会有|带来|产生|表示|喝起来|尝起来|看起来|与|和|及|或者|但是|不过/g;

  function extractFallbackTerm(sentence) {
    const parts = sentence
      .split(PARTICLE_SPLIT)
      .map((s) => s.trim())
      .filter((s) => s.length >= 2 && s.length <= 8 && !STOPWORDS.has(s));
    if (!parts.length) return null;
    // 优先取切分后靠前的片段（通常是句子主干/主语），否则退化为取最长片段
    const good = parts.find((p) => p.length >= 2 && p.length <= 6);
    return good || parts[0];
  }

  function buildItems(text) {
    const sentences = splitSentences(text);
    const items = [];
    sentences.forEach((sentence, index) => {
      const pair = extractPair(sentence);
      if (pair && pair.term.length >= 2 && sentence.includes(pair.term)) {
        items.push({
          sentence,
          term: pair.term,
          definition: pair.definition,
          hasPair: true,
          index,
        });
        return;
      }
      const term = extractFallbackTerm(sentence);
      if (term) {
        items.push({
          sentence,
          term,
          definition: sentence.replace(term, "____"),
          hasPair: false,
          index,
        });
      }
    });
    return items;
  }

  function splitIntoLevels(items) {
    const n = items.length;
    const third = Math.ceil(n / 3);
    return {
      easy: items.slice(0, third),
      medium: items.slice(third, third * 2),
      hard: items.slice(third * 2),
    };
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function uid(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function buildBlankQuestion(item) {
    return {
      id: uid("q"),
      type: "blank",
      stem: item.sentence.split(item.term).join("____"),
      answer: item.term,
    };
  }

  function buildChoiceQuestion(item, allTerms) {
    const pool = allTerms.filter((t) => t !== item.term);
    const distractors = shuffle(pool).slice(0, 3);
    while (distractors.length < 3) distractors.push("（无）");
    const options = shuffle([item.term, ...distractors]);
    const stem = item.hasPair
      ? `以下哪一项与"${item.definition}"最相关？`
      : item.sentence.split(item.term).join("____");
    return {
      id: uid("q"),
      type: "choice",
      stem,
      options,
      answer: item.term,
    };
  }

  function buildMatchQuestions(items) {
    const groupSize = 5;
    const questions = [];
    for (let i = 0; i < items.length; i += groupSize) {
      const group = items.slice(i, i + groupSize);
      if (group.length < 2) continue;
      questions.push({
        id: uid("q"),
        type: "match",
        stem: "请将左侧术语与右侧释义正确匹配",
        pairs: group.map((g) => ({ term: g.term, definition: g.definition })),
      });
    }
    return questions;
  }

  function buildLevelQuestions(items, allTerms) {
    if (!items.length) return [];
    const blankItems = [];
    const choiceItems = [];
    const matchItems = [];
    items.forEach((item, i) => {
      const slot = i % 3;
      if (slot === 0) blankItems.push(item);
      else if (slot === 1) choiceItems.push(item);
      else matchItems.push(item);
    });
    const questions = [
      ...blankItems.map((item) => buildBlankQuestion(item)),
      ...choiceItems.map((item) => buildChoiceQuestion(item, allTerms)),
      ...buildMatchQuestions(
        matchItems.length >= 2
          ? matchItems
          : items.slice(0, groupFallback(items)),
      ),
    ];
    return questions;
  }

  function groupFallback(items) {
    return Math.min(items.length, 4);
  }

  function generateCourse({ title, category, text, ownerUsername }) {
    const items = buildItems(text);
    if (!items.length) {
      return {
        ok: false,
        msg: "未能从文本中提取到有效知识点，请提供更完整的教材内容（建议 100 字以上，包含术语说明句）",
      };
    }
    const allTerms = [...new Set(items.map((i) => i.term))];
    const { easy, medium, hard } = splitIntoLevels(items);

    const course = {
      id: uid("course"),
      title: title || "未命名课程",
      category: category || "通用",
      ownerUsername,
      createdAt: Date.now(),
      sourceLength: text.length,
      levels: {
        easy: buildLevelQuestions(easy, allTerms),
        medium: buildLevelQuestions(medium, allTerms),
        hard: buildLevelQuestions(hard, allTerms),
      },
    };
    return { ok: true, course };
  }

  return { generateCourse, uid };
})();
