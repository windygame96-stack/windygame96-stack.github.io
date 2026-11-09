import { useEffect, useMemo, useState } from "react";
import { priorityQuestions, type RelationshipProfile, type RelationshipQuestion } from "./relationshipGuidance";
import { answered } from "./relationshipFlow";
import { buildRelationshipCard } from "./relationshipCardModel";
import RelationshipShareCard from "./RelationshipShareCard";
import "./RelationshipCard.css";

type ReportProps = { profiles: RelationshipProfile[]; questions: RelationshipQuestion[]; stage: "pre_relationship" | "partnered"; onReset: () => void; onEdit?: (person?: number) => void };
const bridges: Record<string, string> = {
  contact: "各说一个忙时能做到的联系办法，双方都接受再试一周。",
  support: "关心前先问一句：要我听、一起想办法，还是给你空间？",
  conflict: "先确认还能不能聊；需要暂停时，一起约好再聊的时间。",
  repair: "先听失约带来的影响，再商量一个做得到的补救。",
  space: "先保留各自的重要安排，再约一段共同时间。",
  money: "先各报能承担的预算，再决定活动和分担方式。",
  chores: "把一件家务的负责人、完成标准和补位方式说清楚。",
  family: "先问哪些话能对亲友说、由谁说，不擅自转述。",
  commitment: "各说清目前愿意承诺什么；没说好的部分继续留着聊。",
  future: "只选一个重要的未来议题，先听清各自希望和不愿意的部分。",
  privacy: "逐项询问愿不愿分享；不愿意或撤回时就停止。",
  intimacy: "以当下都愿意为前提；不确定或不愿意就停下。",
};

export default function RelationshipReport({ profiles, questions, stage, onReset, onEdit }: ReportProps) {
  const [person, setPerson] = useState(0);
  const cards = useMemo(() => profiles.map(buildRelationshipCard), [profiles]);
  const pair = profiles.length === 2;
  const card = cards[person];
  const common = questions.filter((q) => profiles.every((p) => answered(p, q.id)));
  const differences = pair ? priorityQuestions(common, profiles).filter((q) => profiles[0].answers[q.id].option !== profiles[1].answers[q.id].option).slice(0, 3) : [];
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  return <main className="rf-report rc-report">
    <header className="rc-page-head"><a href="/tests/">← 测试实验室</a><p>把关心，变成对方接得住的样子。</p><h1>{pair ? "你们各有一份相处说明书" : "给另一半的相处说明书"}</h1><span>{pair ? "选 A 或 B，分别下载各自的卡片。" : "下面的话都来自你的选择。觉得贴切，就存成图片发给 ta。"}</span></header>
    {pair && <div className="rc-person-tabs" role="tablist" aria-label="选择谁的说明书">{cards.map((_, index) => <button role="tab" aria-selected={person === index} aria-controls={`rc-panel-${index}`} id={`rc-tab-${index}`} key={index} onClick={() => setPerson(index)}>{index === 0 ? "A 的说明书" : "B 的说明书"}</button>)}</div>}
    <div role={pair ? "tabpanel" : undefined} id={`rc-panel-${person}`} aria-labelledby={pair ? `rc-tab-${person}` : undefined}>
      {card.enough ? <RelationshipShareCard key={card.signature} card={card} label={pair ? (person === 0 ? "A" : "B") : undefined} /> : <section className="rc-not-enough"><h2>先补几道，再写这张卡。</h2><p>已回答 {card.coverage} / 12 题，至少回答 6 题才生成说明卡。{pair ? "这位的回答还不够，另一位可以单独查看。" : "跳过的部分不会被编成某种性格。"}</p>{onEdit && <button className="rf-primary" onClick={() => onEdit(person)}>返回补答</button>}</section>}
    </div>
    {card.enough && <details className="rc-evidence"><summary>为什么给我这个称号？查看选择依据</summary><p>这是本次回答对应的相处昵称，方便伴侣记住你的偏好，不是心理学人格类型。</p><p>{card.titleEvidence.length ? `昵称主要参考：${card.titleEvidence.map((id) => questions.find((q) => q.id === id)?.short).join("、")}。` : "联系、支持和冲突处理都未回答，因此暂不生成具体昵称。"}其他建议逐项来自下面的选择。</p><p>已回答 {card.coverage} / 12 题。{card.missing.length ? `未回答：${card.missing.join("、")}；这些部分不作判断。` : "全部题目已有选择。"}</p>{card.evidence.map((item) => <div key={item.id}><strong>{item.label}</strong><span>你选了：{item.answer}</span><p>写进说明书：{item.tip}</p></div>)}<small>重要性只影响生活小约定的展示顺序。卡片不包含私人补充或旧版追问。</small></details>}
    {pair && <section className="rc-pair-notes"><h2>互相照顾，可以先从这里开始</h2>{common.length < 6 ? <p>双方共同回答的题目不足 6 道，先各看各的说明卡；暂不整理双人差异。</p> : differences.length ? differences.map((q) => <article key={q.id}><h3>{q.short}</h3><p><b>A 想要：</b>{cards[0].evidence.find((item) => item.id === q.id)?.tip}</p><p><b>B 想要：</b>{cards[1].evidence.find((item) => item.id === q.id)?.tip}</p><p className="rc-bridge">{profiles.every((p) => p.answers[q.id].flexibility === "unwilling") ? "双方都不愿调整，先确认能否接受这个差异，别急着答应折中。" : profiles.some((p) => p.answers[q.id].flexibility === "unwilling") ? "至少一方明确不愿调整。先听清边界，不默认让另一方全部迁就。" : bridges[q.id]}</p></article>) : <p>共同回答里没有不同选项。可以用一次真实场景，再确认彼此说的是不是同一回事。</p>}<small>{stage === "partnered" ? "从最近一次真实小事开始聊，一次只改一个安排。" : "还没确定的承诺与未来方向，别用期待代替对方的回答。"}</small></section>}
    <footer className="rc-page-actions">{onEdit && <button onClick={() => onEdit(person)}>修改{pair ? (person === 0 ? " A" : " B") : "我"}的答案</button>}<button onClick={() => window.print()}>打印或保存 PDF</button><button onClick={onReset}>重新测试</button></footer>
  </main>;
}
