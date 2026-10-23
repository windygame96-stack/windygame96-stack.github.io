import { useEffect, useMemo, useState } from "react";
import "./RelationshipFit.css";
import RelationshipReport from "./RelationshipReport";

type Importance = "low" | "medium" | "high";
type Flexibility = "willing" | "conditional" | "unwilling";
type Basis = "experience" | "hypothesis";
type Mode = "solo" | "pair";
type Stage = "pre_relationship" | "partnered";

type Question = {
  id: string;
  short: string;
  text: string;
  options: string[];
};

type Answer = {
  option: number;
  importance: Importance;
  flexibility: Flexibility;
  basis: Basis;
  note: string;
};

type Profile = { name: string; answers: Record<string, Answer>; followups: Record<string, string> };

const questions: Question[] = [
  { id: "contact", short: "联系频率", text: "你连续几天事务很多，与亲近的人见面减少，你通常希望怎样保持联系？", options: ["每天简短联系", "约定时间集中交流", "有空再联系", "根据当周情况共同商量"] },
  { id: "support", short: "压力支持", text: "你遇到一件让自己烦心的事，对方愿意提供支持，你首先希望对方怎样做？", options: ["先听我讲", "一起想办法", "给我独处时间", "先问我此刻需要什么"] },
  { id: "conflict", short: "处理分歧", text: "一段谈话中你们意见不同，情绪开始变强，你通常想怎样继续？", options: ["当场继续谈", "暂停并约时间再谈", "先用文字整理", "视问题和状态决定"] },
  { id: "repair", short: "冲突修复", text: "你答应对方的事情没有做到，对方因此失望，你通常先做什么？", options: ["说明当时情况", "问对方受到什么影响", "提出补救办法", "先整理想法再回应"] },
  { id: "space", short: "个人空间", text: "周末双方都有空，一方想一起活动，一方已有个人安排，你希望如何处理？", options: ["优先保留个人安排", "优先安排共同活动", "重新分配各自和共同时间", "看这件事对彼此的重要程度"] },
  { id: "money", short: "共同支出", text: "你们计划一项共同活动，双方预算不同，你倾向怎样决定支出？", options: ["按相同比例或金额分担", "根据各自负担能力分担", "轮流承担并定期确认", "先调整活动和预算再商量"] },
  { id: "chores", short: "生活分工", text: "假设你们需要长期共同处理家务或其他琐事，你更倾向哪种安排？", options: ["固定分工", "根据当周时间调整", "轮流负责", "先列清任务和标准再决定"] },
  { id: "family", short: "亲友边界", text: "亲友对你们的一项安排有不同意见，你希望如何处理？", options: ["双方先讨论再回应亲友", "分别与各自亲友沟通", "邀请相关人一起谈", "根据事情与谁相关决定范围"] },
  { id: "commitment", short: "关系承诺", text: "一段关系逐渐变得重要，你希望何时讨论关系形式、承诺或是否排他？", options: ["进一步投入前明确", "随相处逐步讨论", "有具体需要时再讨论", "目前还不确定"] },
  { id: "future", short: "长期方向", text: "当一段关系可能持续较长时间，你希望怎样讨论居住、工作、婚姻或是否养育孩子？", options: ["尽早明确重要方向", "列出偏好并保留变化空间", "临近决定时再谈", "部分已有想法，其他未定"] },
  { id: "privacy", short: "隐私边界", text: "对方提出共享位置、设备访问或私人聊天内容，你希望怎样决定？", options: ["分项约定范围与期限", "保留这些信息私密", "按具体用途临时提供", "还没想好，需要先讨论"] },
  { id: "intimacy", short: "身体亲近", text: "你们想要的身体亲近程度或表达喜爱的方式不同，你希望怎样处理？", options: ["当下直接表达愿意或不愿意", "商量彼此舒服的表达方式", "给彼此时间后再确认", "依情境决定并保留改变主意的空间"] },
];

const emptyAnswer = (): Answer => ({ option: -1, importance: "medium", flexibility: "conditional", basis: "hypothesis", note: "" });
const safeStore = (key: string, value: unknown) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ } };
const safeRead = <T,>(key: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(key) || "") as T; } catch { return fallback; } };

function makeFollowups(answers: Record<string, Answer>) {
  return questions
    .filter((q) => answers[q.id]?.importance === "high" || answers[q.id]?.flexibility === "unwilling")
    .slice(0, 3)
    .map((q) => ({
      id: q.id,
      question: answers[q.id]?.basis === "experience"
        ? `最近一次遇到“${q.short}”相关的情况时，你具体做了什么？结果怎样？`
        : `关于“${q.short}”，什么条件会让你觉得这个安排可以接受？`,
    }));
}

export default function RelationshipFit() {
  const [screen, setScreen] = useState<"intro" | "quiz" | "followup" | "handoff" | "report">(() => safeRead("rf-screen", "intro"));
  const [mode, setMode] = useState<Mode>(() => safeRead("rf-mode", "solo"));
  const [stage, setStage] = useState<Stage>(() => safeRead("rf-stage", "pre_relationship"));
  const [person, setPerson] = useState(0);
  const [index, setIndex] = useState(0);
  const [profiles, setProfiles] = useState<Profile[]>(() => safeRead("rf-profiles", [{ name: "我", answers: {}, followups: {} }]));
  const current = profiles[person] || { name: person === 0 ? "A" : "B", answers: {}, followups: {} };
  const answer = current.answers[questions[index]?.id] || emptyAnswer();
  const followups = useMemo(() => makeFollowups(current.answers), [current.answers]);
  const [followIndex, setFollowIndex] = useState(0);

  useEffect(() => { safeStore("rf-screen", screen); safeStore("rf-mode", mode); safeStore("rf-stage", stage); safeStore("rf-profiles", profiles); }, [screen, mode, stage, profiles]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Relationship Fit · 关系使用说明书";
    return () => { document.title = previousTitle; };
  }, []);

  const updateProfile = (fn: (profile: Profile) => Profile) => setProfiles((all) => { const next = [...all]; next[person] = fn(next[person] || current); return next; });
  const updateAnswer = (patch: Partial<Answer>) => updateProfile((p) => ({ ...p, answers: { ...p.answers, [questions[index].id]: { ...answer, ...patch } } }));
  const begin = () => { setProfiles([{ name: mode === "pair" ? "A" : "我", answers: {}, followups: {} }]); setPerson(0); setIndex(0); setScreen("quiz"); };
  const nextQuestion = () => {
    if (answer.option < 0) return;
    if (index < questions.length - 1) setIndex((v) => v + 1);
    else { setFollowIndex(0); setScreen(followups.length ? "followup" : mode === "pair" && person === 0 ? "handoff" : "report"); }
  };
  const finishFollowup = () => {
    if (followIndex < followups.length - 1) setFollowIndex((v) => v + 1);
    else setScreen(mode === "pair" && person === 0 ? "handoff" : "report");
  };
  const startSecond = () => { setProfiles((all) => [...all, { name: "B", answers: {}, followups: {} }]); setPerson(1); setIndex(0); setFollowIndex(0); setScreen("quiz"); };
  const reset = () => { localStorage.removeItem("rf-screen"); localStorage.removeItem("rf-mode"); localStorage.removeItem("rf-stage"); localStorage.removeItem("rf-profiles"); setProfiles([{ name: "我", answers: {}, followups: {} }]); setScreen("intro"); setPerson(0); setIndex(0); };

  if (screen === "report") return <RelationshipReport profiles={profiles} questions={questions} stage={stage} onReset={reset} />;

  return <main className="rf-shell">
    <a className="rf-brand" href="/"><span>RF</span> Relationship Fit</a>
    {screen === "intro" && <section className="rf-intro">
      <p className="rf-kicker">关系使用说明书 · 初版</p>
      <h1>喜欢是直觉。<br /><i>合适，需要聊清楚。</i></h1>
      <p className="rf-intro__lead">12 个中立情境题，加上最多 3 个基于回答的追问。它不会给你们打分，只帮你看清需求、边界和可以商量的条件。</p>
      <div className="rf-mode-grid">
        <button className={mode === "solo" ? "active" : ""} onClick={() => setMode("solo")}><strong>先了解自己</strong><span>生成一份个人关系使用说明书</span></button>
        <button className={mode === "pair" ? "active" : ""} onClick={() => setMode("pair")}><strong>两人本机体验</strong><span>轮流作答，生成一份讨论地图</span></button>
      </div>
      {mode === "pair" && <div className="rf-stage"><span>你们目前</span><button className={stage === "pre_relationship" ? "active" : ""} onClick={() => setStage("pre_relationship")}>确定关系前</button><button className={stage === "partnered" ? "active" : ""} onClick={() => setStage("partnered")}>已经在一起</button></div>}
      <div className="rf-consent"><strong>开始前知道这些</strong><p>本初版只把答案保存在当前浏览器，不上传服务器。两人模式需要轮流使用同一设备，交接时不会显示上一人的答案。请只回答你愿意记录的内容。</p></div>
      <button className="rf-primary" onClick={begin}>开始，大约 6 分钟 <span>→</span></button>
      <small>面向自报年满 18 岁的用户 · 不是心理诊断或关系成败预测</small>
    </section>}

    {screen === "quiz" && <section className="rf-quiz">
      <header><span>{mode === "pair" ? `${current.name} 的独立作答` : "个人梳理"}</span><b>{index + 1} / {questions.length}</b></header>
      <div className="rf-progress"><i style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
      <p className="rf-kicker">{questions[index].short}</p><h1>{questions[index].text}</h1>
      <div className="rf-options">{questions[index].options.map((option, i) => <button className={answer.option === i ? "active" : ""} onClick={() => updateAnswer({ option: i })} key={option}><span>{String.fromCharCode(65 + i)}</span>{option}</button>)}</div>
      <div className="rf-meta"><label>这件事对你多重要？<select value={answer.importance} onChange={(e) => updateAnswer({ importance: e.target.value as Importance })}><option value="low">不太重要</option><option value="medium">比较重要</option><option value="high">非常重要</option></select></label><label>你愿意调整吗？<select value={answer.flexibility} onChange={(e) => updateAnswer({ flexibility: e.target.value as Flexibility })}><option value="willing">愿意调整</option><option value="conditional">有条件</option><option value="unwilling">不愿调整</option></select></label><label>回答依据<select value={answer.basis} onChange={(e) => updateAnswer({ basis: e.target.value as Basis })}><option value="hypothesis">现在的设想</option><option value="experience">具体经历</option></select></label></div>
      <label className="rf-note">可选补充：什么条件会让你接受或不能接受？<textarea value={answer.note} maxLength={240} onChange={(e) => updateAnswer({ note: e.target.value })} placeholder="不需要写私人细节，一句话就够。" /></label>
      <footer><button disabled={index === 0} onClick={() => setIndex((v) => v - 1)}>← 上一题</button><button className="rf-primary" disabled={answer.option < 0} onClick={nextQuestion}>{index === questions.length - 1 ? "进入追问" : "下一题 →"}</button></footer>
    </section>}

    {screen === "followup" && <section className="rf-followup"><span className="rf-pill">证据追问 {followIndex + 1} / {followups.length}</span><p className="rf-kicker">因为你很在意 {questions.find((q) => q.id === followups[followIndex].id)?.short}</p><h1>{followups[followIndex].question}</h1><textarea autoFocus value={current.followups[followups[followIndex].id] || ""} maxLength={500} onChange={(e) => updateProfile((p) => ({ ...p, followups: { ...p.followups, [followups[followIndex].id]: e.target.value } }))} placeholder="写下你愿意记录的部分。也可以跳过。"/><div><button className="secondary" onClick={finishFollowup}>跳过</button><button className="rf-primary" onClick={finishFollowup}>保存并继续 →</button></div></section>}

    {screen === "handoff" && <section className="rf-handoff"><span className="rf-pill">A 已完成</span><h1>现在，把设备交给 B。</h1><p>A 的具体答案已隐藏。B 将独立完成同一组题，完成前不会看到 A 的选择。</p><button className="rf-primary" onClick={startSecond}>我是 B，开始作答 →</button><small>同一浏览器上的答案只用于生成这次本机报告。</small></section>}
  </main>;
}
