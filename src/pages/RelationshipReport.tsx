import { useEffect, useState } from "react";
import { priorityQuestions, topicDecision, topicGuides, type RelationshipProfile, type RelationshipQuestion } from "./relationshipGuidance";
import { answered } from "./relationshipFlow";

const importanceLabels = { low: "不太重要", medium: "比较重要", high: "你选的重点", unknown: "未标重要性" };
const flexibilityLabels = { willing: "愿意调整", conditional: "有条件调整", unwilling: "不愿调整", unknown: "调整意愿未补充" };

type ReportProps = { profiles: RelationshipProfile[]; questions: RelationshipQuestion[]; stage: "pre_relationship" | "partnered"; onReset: () => void; onEdit?: () => void };
export default function RelationshipReport(props: ReportProps) {
  const covered = props.questions.filter((q) => props.profiles.every((p) => answered(p, q.id)));
  if (covered.length < 6) return <main className="rf-report"><header className="rf-report__hero"><span className="rf-pill">回答还不够</span><h1>先补几道，再看建议。</h1><p>{props.profiles.length === 2 ? "双方共同回答" : "已回答"} {covered.length} / 12 题。至少 6 个有效话题才展示行动建议；这是产品的信息量门槛，不是科学标准。</p><p>跳过的题不会被当成某一种偏好，也不会据此判断你们是否合适。</p></header><footer className="rf-report__footer">{props.onEdit && <button onClick={props.onEdit}>返回补答</button>}<button onClick={props.onReset}>重新开始</button><a href="/tests/">返回测试实验室</a></footer></main>;
  return <ReportContent {...props} questions={covered} />;
}

function ReportContent({ profiles, questions, stage, onReset, onEdit }: ReportProps) {
  const pair = profiles.length === 2;
  const ordered = priorityQuestions(questions, profiles);
  const [focus, setFocus] = useState(ordered[0].id);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);
  const current = questions.find((q) => q.id === focus)!;
  const guide = topicGuides[focus];
  const decision = topicDecision(current, profiles);
  const firmDifference = profiles.some((p) => p.answers[focus].flexibility === "unwilling") && (!pair || profiles[0].answers[focus].option !== profiles[1].answers[focus].option);
  const agreed = pair ? questions.filter((q) => profiles[0].answers[q.id].option === profiles[1].answers[q.id].option) : [];

  function topicCard(q: RelationshipQuestion, position: number) {
    const suggestion = topicDecision(q, profiles);
    return <article className="rf-insight" key={q.id}>
      <header><span>0{position + 1}</span><h3>{q.short}</h3><b>{suggestion.label}</b></header>
      <div className="rf-answer-grid">{profiles.map((p) => {
        const a = p.answers[q.id];
        return <div key={p.name}><small>{pair ? p.name : "你的选择"} · {importanceLabels[a.importance]} · {flexibilityLabels[a.flexibility]}</small><strong>{q.options[a.option]}</strong><p>{topicGuides[q.id].meanings[a.option]}。</p><small>{a.basis === "experience" ? "你自报依据经历；未独立验证" : a.basis === "hypothesis" ? "当前期待，不能说明真实行为" : "未补充经历依据；仅描述本次选择"}</small>
          {!pair && a.note.trim() && <blockquote>你的补充：{a.note}</blockquote>}
          {!pair && p.followups[q.id]?.trim() && <blockquote>你的追问记录：{p.followups[q.id]}</blockquote>}
        </div>;
      })}</div>
      <p>{suggestion.text}</p>
      <div className="rf-guidance-row"><b>先核对</b><p>{topicGuides[q.id].check}</p></div>
      <button className="rf-focus-button" onClick={() => { setFocus(q.id); document.getElementById("rf-plan")?.scrollIntoView({ behavior: "smooth" }); }}>用这一项制定行动 →</button>
    </article>;
  }

  return <main className="rf-report">
    <header className="rf-report__hero"><span className="rf-pill">{pair ? "双方共同回答" : "已回答"} {questions.length} / 12 题</span><h1>{pair ? "你们的关系行动指南" : "你的关系使用说明书"}</h1><p>{pair ? "把不同的期待说清楚，再共同决定下一步。" : `关于${ordered[0].short}，你更倾向“${ordered[0].options[profiles[0].answers[ordered[0].id].option]}”；可以先用下面的话术说明这个期待。`}</p><a href="/tests/">← 返回测试实验室</a></header>
    <section className="rf-report__section"><p className="rf-kicker">先聊这几件事</p><h2>{ordered.slice(0, 3).map((q) => q.short).join("、")}</h2><p>挑一项往下看，拿走一句话术和一个可以尝试的安排。</p><details><summary>这些建议怎么来的？</summary><p>依据本次选择和你自愿补充的重点、调整意愿。没有填写的信息仍是未知；跳过的话题不作判断。先显示已标重点和明确边界，再看双方差异；同级按题目顺序，不代表轻重排名。</p><p>{pair ? "仅比较双方都回答的话题，私人补充不展示。" : "描述当前选择，不推断人格或未经说明的经历。"}相同选项也不证明实际行为一致。</p></details></section>
    <section className="rf-report__section"><p className="rf-kicker">选择 → 理解 → 下一步</p>{ordered.slice(0, 3).map(topicCard)}{ordered.length > 3 && <button className="rf-focus-button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>{expanded ? "收起其他主题" : `查看另外 ${ordered.length - 3} 个主题`}</button>}{expanded && ordered.slice(3).map((q, index) => topicCard(q, index + 3))}</section>
    <section className="rf-report__section rf-plan" id="rf-plan"><p className="rf-kicker">一次只行动一件事</p><h2>{pair ? "先达成一个具体约定" : "写下一个可以直接说出的请求"}</h2>
      <label>这次先处理<select value={focus} onChange={(e) => setFocus(e.target.value)}>{ordered.map((q) => <option key={q.id} value={q.id}>{q.short}</option>)}</select></label>
      <div className="rf-guidance-row"><b>怎么开口</b><p>“关于{current.short}，我现在倾向{current.options[profiles[0].answers[focus].option]}。{pair ? `我看到你选了${current.options[profiles[1].answers[focus].option]}，想先听听你在什么情况下会这样选择。` : "这对我意味着什么，我还想用一次真实经历说清楚。"}我们先确认彼此不能接受的部分，再决定要不要试一个安排。”</p></div>
      <div className="rf-guidance-row"><b>{firmDifference ? "先确认，不急着试行" : "可讨论的做法"}</b><p>{firmDifference ? `${decision.text}分别说出：这条要求具体是什么、为什么不能接受、有没有自愿接受的其他方式。若仍无共识，明确记录“尚未达成”，不要把沉默当成同意。` : guide.agreement}</p></div>
      <div className="rf-guidance-row"><b>怎样复盘</b><p>{firmDifference ? "双方明确同意再谈的时间；如果有人不愿继续讨论，尊重这个决定，不重复施压。" : guide.review}</p></div>
      <p className="rf-plan-note">{pair ? (stage === "partnered" ? "已交往：带上最近一次真实分歧，分别讲行为和影响，再谈下次做法。" : "确定关系前：可以讨论假设场景；未确认的承诺与长期方向继续标为未定。") : "没有恋爱经历也可以先把请求说具体；在朋友或家人相处中的经验可作参考，但不能直接当成恋爱中一定如此。"}</p>
    </section>
    {pair && <section className="rf-report__section"><p className="rf-kicker">可作为起点的共同选择</p><h2>{agreed.length ? agreed.map((q) => q.short).join("、") : "暂时没有相同选项"}</h2><p>{agreed.length ? "选项相同只能说明当前表达相近，仍需确认具体含义。" : "不同选项并不等于无法相处；请按上面的重要性、边界和接受条件逐项核对。"}</p></section>}
    <footer className="rf-report__footer"><button onClick={() => window.print()}>打印或保存 PDF</button>{onEdit && <button className="secondary" onClick={onEdit}>返回修改答案</button>}<button className="secondary" onClick={onReset}>重新开始</button><a href="/tests/">返回测试实验室</a></footer>
  </main>;
}
