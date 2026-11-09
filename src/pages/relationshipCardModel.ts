import { relationshipQuestions as questions } from "./relationshipQuestions";
import { answered } from "./relationshipFlow";
import type { RelationshipProfile } from "./relationshipGuidance";

export const CARD_VERSION = "rf-card-1.0";
export type CardLine = { id: string; label: string; text: string };
export type RelationshipCard = { version: string; signature: string; owner: string; title: string; subtitle: string; coverage: number; enough: boolean; titleEvidence: string[]; care: CardLine[]; upset: CardLine[]; avoid: CardLine[]; everyday: CardLine[]; boundaries: CardLine[]; quote: string; missing: string[]; evidence: { id: string; label: string; answer: string; tip: string }[] };

// Nicknames describe two selected preferences, not personality scores. Rows are
// contact options and columns are support options. Missing answers stay missing.
const titles = [
  ["每日回应小暖炉", "并肩解题行动派", "需要回信的独处星球", "有回应的商量派"],
  ["深聊充电站", "并肩闯关搭档", "有约定的独处星球", "认真商量合伙人"],
  ["自在深聊派", "自由行动搭档", "自在留白小星球", "随心商量搭档"],
  ["先听再商量的搭档", "一起想办法的搭档", "有商有量的独处派", "双向确认合伙人"],
];
const singleSupportTitles = ["先听我说的倾听派", "一起解题的行动派", "先留一点空间的独处派", "先问一句的商量派"];
const singleContactTitles = ["每日回应小暖炉", "留时间深聊的搭档", "自在联系的搭档", "一起安排的商量派"];
const conflictTitles = ["想把话聊清的直球搭档", "暂停再聊的冷静搭档", "写下来更好说的文字派", "看状态再聊的灵活搭档"];

const tips: Record<string, string[]> = {
  contact: ["每天留一句问候，忙时也简单说一声。", "留一段不被打扰的时间，好好聊一次。", "联系可以随当天的余力安排，别默认我随时在线。", "这周怎么联系，我们先按各自安排商量。"],
  support: ["我烦心时，先听我讲完，再问要不要建议。", "我烦心时，可以陪我一起拆问题、找办法。", "我烦心时，先让我静一静，再约时间聊。", "先问我想被听见、一起想办法，还是静一静。"],
  conflict: ["我更想当下说清楚；先问彼此还能不能继续谈。", "情绪上来时，先暂停，再约一个双方能接受的返回时间。", "难开口的话，让我先写下来，再一起看。", "先看我们现在的状态，再决定继续聊还是缓一缓。"],
  repair: ["我没做到时，通常先解释情况；也请提醒我听听你的感受。", "我失约后，通常先问你哪里受了影响。", "我失约后，通常先想怎么补救；我们一起确认补救是否有用。", "我没做到时，需要先整理一下，再给你回应。"],
  space: ["我已有的个人安排，请先帮我留住，再约共同时间。", "周末可以优先留一段时间，认真一起做点事。", "先把各自的时间留出来，再安排我们的时间。", "遇到安排冲突，先说这件事对各自有多重要。"],
  money: ["共同花钱前，把各自出多少、按金额还是比例说清楚。", "一起花钱时，先考虑彼此能负担多少。", "可以轮流买单，但记得定期问彼此是否舒服。", "先选双方都负担得起的活动，再商量怎么付。"],
  chores: ["家务固定分工会让我更好安排；也说清做不完时怎么办。", "分工可以看当周谁有空，但别让一个人一直兜底。", "琐事可以轮流做，把交接和完成标准说清楚。", "先列出要做的事、怎样算做完，再分工。"],
  family: ["亲友有意见时，我们先聊清楚，再一起回应。", "各自先与自己的亲友沟通，别把难题直接推给对方。", "相关的人可以一起聊，但先问彼此愿不愿意。", "谁参与讨论，先看这件事和谁有关。"],
  commitment: ["进一步投入前，先聊清楚我们是什么关系、愿意承诺什么。", "承诺可以慢慢聊，但别把没说过的话当成默认同意。", "出现具体需要时，记得把关系约定拿出来聊。", "关于承诺我还没想好，先留在待讨论里。"],
  future: ["长期方向我希望早些聊，不用等到必须决定时才发现分歧。", "先说出未来的偏好，也给彼此保留改变想法的空间。", "具体决定临近时，再认真确认我们的长期方向。", "未来有些事我想好了、有些还没有，请分开问。"],
  privacy: ["位置、设备和聊天内容，先逐项问我愿不愿意分享。", "我想保留私密信息；请别用查手机来证明感情。", "有明确用途时可以问我是否愿意临时分享，用完就停。", "隐私分享我还没想好，请先问，不要替我决定。"],
  intimacy: ["身体接触前，给我直接说愿意或不愿意的空间。", "一起找双方舒服的亲近方式，不舒服就换或停。", "亲近节奏不同时，先给彼此时间，再问一次。", "亲近要看当下，我随时可以改变主意。"],
};

const avoidContact = ["忙可以先说，别让我靠猜才知道下次什么时候联系。", "别只挤出零碎回复，却一直不留好好说话的时间。", "别因为我没即时回复，就直接下结论说我不在乎。", "别单方面定下联系规矩，却不问我的安排。"];
const avoidSupport = ["别急着说“你想太多了”，也别还没听完就开始上课。", "别只说“没事的”，可以先问我想从哪一步一起想办法。", "别追着问到我必须立刻说清；留点空间也请约好再联系。", "别替我决定现在该被安慰还是听建议，先问一句。"];
const quotes = ["你先说，我听着。你想要建议的时候，我再陪你想。", "你最想先解决哪一小块？我们一起想办法。", "你先歇一会儿。什么时候方便再聊，我们一起定。", "你现在想让我听、帮你想办法，还是给你一点空间？"];
const everydayLabels: Record<string, string> = { contact: "平时怎么联系", support: "我心烦的时候", conflict: "闹别扭的时候", repair: "我做错事的时候", space: "约会和独处", money: "一起花钱", chores: "家务怎么分", family: "面对双方亲友", commitment: "我们是什么关系", future: "以后怎么打算", privacy: "手机和隐私", intimacy: "身体上的亲近" };

export function buildRelationshipCard(profile: RelationshipProfile): RelationshipCard {
  const valid = questions.filter((q) => answered(profile, q.id));
  const has = (id: string) => valid.some((q) => q.id === id);
  const option = (id: string) => profile.answers[id].option;
  const contact = has("contact"), support = has("support");
  const enough = valid.length >= 6;
  let title = "待补全的相处说明卡";
  let titleEvidence: string[] = [];
  if (enough && contact && support) { title = titles[option("contact")][option("support")]; titleEvidence = ["contact", "support"]; }
  else if (enough && support) { title = singleSupportTitles[option("support")]; titleEvidence = ["support"]; }
  else if (enough && contact) { title = singleContactTitles[option("contact")]; titleEvidence = ["contact"]; }
  else if (enough && has("conflict")) { title = conflictTitles[option("conflict")]; titleEvidence = ["conflict"]; }
  const lines = (ids: string[]): CardLine[] => ids.filter(has).map((id) => ({ id, label: everydayLabels[id], text: tips[id][option(id)] }));
  const everydayIds = ["money", "chores", "commitment", "family", "future", "repair"].filter(has);
  // Explicit priorities can change the shortlist, never the meaning of an answer.
  everydayIds.sort((a, b) => Number(profile.answers[b].importance === "high") - Number(profile.answers[a].importance === "high"));
  const summaryParts: string[] = [];
  if (contact) summaryParts.push(["日常有回应", "留时间深聊", "联系留点弹性", "联系先商量"][option("contact")]);
  if (support) summaryParts.push(["烦心先听我说", "烦心一起想办法", "烦心先让我静静", "关心前先问一句"][option("support")]);
  const avoid: CardLine[] = [];
  if (support) avoid.push({ id: "support", label: "烦心时", text: avoidSupport[option("support")] });
  if (contact) avoid.push({ id: "contact", label: "联系时", text: avoidContact[option("contact")] });
  return {
    version: CARD_VERSION,
    signature: `${CARD_VERSION}:${profile.name}:${valid.map((q) => `${q.id}:${option(q.id)}:${profile.answers[q.id].importance}`).join("|")}`,
    owner: profile.name,
    title,
    subtitle: summaryParts.join("，") || "我没回答的部分，请直接问我，别靠猜。",
    coverage: valid.length,
    enough,
    titleEvidence,
    care: enough ? lines(["contact", "space"]) : [],
    upset: enough ? lines(["support", "conflict"]) : [],
    avoid: enough ? avoid : [],
    everyday: enough ? lines(everydayIds.slice(0, 3)) : [],
    boundaries: enough ? lines(["privacy", "intimacy"]) : [],
    quote: enough && support ? quotes[option("support")] : "我现在需要什么，你可以直接问。我也会听听你的需要。",
    missing: questions.filter((q) => !has(q.id)).map((q) => q.short),
    evidence: valid.map((q) => ({ id: q.id, label: q.short, answer: q.options[option(q.id)], tip: tips[q.id][option(q.id)] })),
  };
}

export function cardSections(card: RelationshipCard): { title: string; items: CardLine[] }[] {
  return [
    { title: "平时这样对我好", items: card.care },
    { title: "我不开心时，请这样靠近", items: card.upset },
    { title: "这些做法，请换一种", items: card.avoid },
    { title: "一起生活的小约定", items: card.everyday },
    { title: "再亲近，也请先问我", items: card.boundaries },
  ].filter((section) => section.items.length > 0);
}
