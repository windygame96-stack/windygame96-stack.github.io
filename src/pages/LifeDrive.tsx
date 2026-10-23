import { useEffect, useMemo, useState } from "react";
import "./LifeDrive.css";
import LifeActionGuide from "./LifeActionGuide";

type DriveKey = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
type Screen = "intro" | "quiz" | "result";

type Drive = {
  key: DriveKey;
  name: string;
  line: string;
  need: string;
  charged: string;
  drained: string;
  caution: string;
  actions: string[];
};

type Question = { title: string; options: Record<DriveKey, string> };

const keys: DriveKey[] = ["A", "B", "C", "D", "E", "F", "G", "H"];

const drives: Record<DriveKey, Drive> = {
  A: { key: "A", name: "自主", line: "我需要选择权，也需要时间属于自己。", need: "对时间、节奏和方向拥有真实的决定权。", charged: "可以自己安排过程、明确边界，并为选择负责时。", drained: "被过度干预、长期按别人的节奏行动，或没有拒绝空间时。", caution: "你可能把必要的协作误读成控制，也可能因维护自由而回避承诺。", actions: ["拿回今天 30 分钟的完整支配权", "明确一件由你决定方式的任务", "说清一个最近被越过的边界"] },
  B: { key: "B", name: "精进", line: "我需要持续变强，并掌握更难的事情。", need: "看见能力在积累，挑战与水平一起上升。", charged: "专注练习、解决难题，并得到具体反馈时。", drained: "长期原地重复、缺少进步证据，或任务难度与能力不匹配时。", caution: "你可能把休息视为退步，或一直打磨而迟迟不交付。", actions: ["选一个可在 20 分钟内练习的微技能", "向可信的人索取一条具体反馈", "记录本周一个已经变强的证据"] },
  C: { key: "C", name: "创造", line: "我需要把想法变成能看见的成果。", need: "把个人表达、概念或审美转化为真实作品。", charged: "从零开始、快速做出原型，并让抽象想法落地时。", drained: "只吸收不输出、想法长期搁置，或表达空间被压缩时。", caution: "你可能偏爱开头的新鲜感，低估收尾、维护和传播的价值。", actions: ["把一个想法做成最小可见版本", "给半成品设一个停止修改的时间", "公开或发给一个人，完成一次交付"] },
  D: { key: "D", name: "探索", line: "我需要变化、未知和新的可能。", need: "接触陌生信息、环境与尚未被确定的方向。", charged: "研究新主题、进入新场景，或发现意外联系时。", drained: "生活高度重复、答案早已写好，或没有试错空间时。", caution: "你可能把更换方向当成解决问题，或因追逐新鲜感难以沉淀。", actions: ["换一条路线或一个工作环境", "研究一个与你当前领域相邻的新主题", "给新尝试设定范围和复盘日期"] },
  E: { key: "E", name: "归属", line: "我需要亲密、信任和稳定的陪伴。", need: "在重要关系里被理解、接纳，并拥有可靠连接。", charged: "能坦诚表达、得到回应，也能照顾彼此边界时。", drained: "关系疏离、信任不稳，或长期只有表面交流时。", caution: "你可能为了维持连接过度迁就，把对方的需要放在自己之前。", actions: ["联系一个让你可以放松的人", "表达一个具体感受和一项具体需要", "分清陪伴别人和替别人负责"] },
  F: { key: "F", name: "贡献", line: "我需要确认自己的行动改善了什么。", need: "知道努力服务于真实的人，并产生可以感知的帮助。", charged: "理解他人的问题、提供解决方案，并看见改善时。", drained: "工作与受益者断开、价值模糊，或努力没有实际落点时。", caution: "你可能承担超出边界的责任，甚至把被需要当成自我价值来源。", actions: ["写下当前工作具体帮助了谁", "做一件范围清楚、当天可完成的帮助", "确认哪些问题不该由你独自承担"] },
  G: { key: "G", name: "成就", line: "我需要目标、结果和清楚的反馈。", need: "向明确目标推进，并确认努力换来了可见结果。", charged: "目标清楚、难度适中、进展可追踪并获得认可时。", drained: "长期没有终点、评价含糊，或努力与结果脱节时。", caution: "你可能把成绩等同于自我价值，在完成后也来不及感受满足。", actions: ["把今天的目标改写成一个可完成结果", "缩短反馈周期，今天就检查一次进展", "完成后停下来记录成果，而非立刻追下一个"] },
  H: { key: "H", name: "安全", line: "我需要秩序、资源和可承受的风险。", need: "拥有稳定节奏、基本资源和可以预判的生活边界。", charged: "信息充分、风险可控、计划留有余量时。", drained: "变化过密、资源不足，或长期处于混乱和不可预测中时。", caution: "你可能为了规避风险延后必要变化，也可能用计划替代真正行动。", actions: ["先恢复睡眠、饮食或空间中的一个秩序", "列出最坏情况与可承受的应对方案", "只推进下一步，不要求一次消除全部不确定"] },
};

const questions: Question[] = [
  { title: "突然多出一个完全自由的周末，你最想做什么", options: { A: "完全按自己的节奏安排", B: "集中练习一项能力", C: "做一个自己的作品", D: "去陌生地方或研究新主题", E: "和亲近的人深入相处", F: "帮一个人解决实际问题", G: "完成一个明确目标", H: "休息整理，让生活恢复稳定" } },
  { title: "完成一件困难的事，哪个结果最让你满足", options: { A: "事情由我自己决定推进", B: "明显感觉自己的能力变强", C: "一个新想法被真正实现", D: "发现意料之外的新可能", E: "感到被理解和接纳", F: "给别人带来实际改善", G: "达到一个有挑战的目标", H: "风险降低，生活更可控" } },
  { title: "收入相同，你更愿意选择哪种工作", options: { A: "拥有较大的决策权", B: "能持续钻研复杂能力", C: "可以从零创造产品", D: "经常接触陌生问题", E: "团队关系紧密可信", F: "能产生明确的社会价值", G: "晋升和奖励非常清楚", H: "收入和节奏稳定可预测" } },
  { title: "哪种状态最让你无法长期忍受", options: { A: "时间和决定被别人控制", B: "长期停滞，没有进步", C: "有想法却不能实现", D: "每天重复，没有新事物", E: "缺少亲密关系和归属感", F: "做的事情对谁都没帮助", G: "努力却始终没有结果", H: "生活混乱并充满风险" } },
  { title: "你最容易羡慕哪类人", options: { A: "能决定自己时间和方向", B: "在一个领域非常专业", C: "拥有大量个人作品", D: "拥有丰富的人生经历", E: "拥有深厚关系和陪伴", F: "真正改善了许多人的生活", G: "取得了突出的成绩", H: "生活稳定，资源充足" } },
  { title: "在团队里，你最自然地承担什么角色", options: { A: "决定方向和工作方式", B: "攻克最困难的问题", C: "提出概念并做出原型", D: "调研新方向和可能性", E: "维护信任和成员关系", F: "理解用户并解决其问题", G: "推动团队达到目标", H: "制定流程并控制风险" } },
  { title: "为了真正想要的生活，你最愿意承担哪种代价", options: { A: "为自主暂时降低收入", B: "为精进长期重复练习", C: "为创作接受无人关注", D: "为体验离开熟悉环境", E: "为重要关系调整安排", F: "为帮助别人承担额外责任", G: "为成绩承受竞争压力", H: "为稳定延迟眼前享受" } },
  { title: "未来三年，你最希望增加什么", options: { A: "更多属于自己的选择权", B: "更明显的能力提升", C: "更多真正完成的作品", D: "更多陌生经历和可能", E: "更深、更稳定的关系", F: "更大的实际影响", G: "更突出的成绩和认可", H: "更充足的资源和安全感" } },
  { title: "感到疲惫时，什么最能让你恢复能量", options: { A: "独处并重新掌控时间", B: "学会一个原本不会的东西", C: "随手做出一个小作品", D: "换环境，接触新事物", E: "与信任的人相处", F: "帮别人解决一个问题", G: "完成一项明确任务", H: "恢复规律和确定的生活" } },
  { title: "如果没人知道或评价，你仍最可能选择什么", options: { A: "按照自己的方式生活", B: "深入掌握一项能力", C: "创作一个不公开的作品", D: "体验陌生的人生经历", E: "维持自己珍惜的关系", F: "做一件对别人有帮助的事", G: "完成一个自己的目标", H: "建立稳定、低风险的生活" } },
];

const storageKey = "life-drive-answers-v1";

function rankAnswers(answers: DriveKey[]) {
  const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<DriveKey, number>;
  answers.forEach((key) => { counts[key] += 1; });
  const levels = [...new Set(Object.values(counts))].sort((a, b) => b - a);
  const primary = keys.filter((key) => counts[key] === levels[0]);
  const secondary = levels[1] > 0 ? keys.filter((key) => counts[key] === levels[1]) : [];
  return { counts, primary, secondary };
}

function Result({ answers, restart }: { answers: DriveKey[]; restart: () => void }) {
  const { counts, primary, secondary } = rankAnswers(answers);
  const max = Math.max(...Object.values(counts));
  const main = primary.map((key) => drives[key]);
  const support = secondary.map((key) => drives[key]);
  const summary = `你在这些题里更常选择${main.map((item) => item.name).join("＋")}${support.length ? `，其次是${support.map((item) => item.name).join("＋")}` : ""}。`;

  const copyResult = async () => {
    const text = `我的生活源动力：${summary}\n${main.map((item) => `${item.key} ${item.name}：${item.line}`).join("\n")}\nhttps://www.escapefromhongye.xyz/life-drive/`;
    await navigator.clipboard?.writeText(text);
  };

  return <main className="ld-result">
    <header className="ld-result__head"><div><p>REFLECTION · 10 / 10</p><h1>看懂选择<br />找到下一步</h1></div><span>RESULTS<br />02</span></header>
    <section className="ld-ranking">
      <div><small>{primary.length > 1 ? "并列第一" : "第一名"}</small><strong>{main.map((item) => item.name).join("＋")}</strong><p>当前主动力</p></div>
      <div><small>次高计数</small><strong>{support.map((item) => item.name).join("＋") || "暂无其他非零项"}</strong><p>同样值得照顾的需要</p></div>
      <div><small>结果说明</small><strong>{primary.length > 1 ? "存在并列" : "当前聚焦"}</strong><p>并列代表多种需要同样突出</p></div>
    </section>
    <section className="ld-summary"><p>先看你的选择，再决定怎么用</p><h2>{summary}</h2><span>最高计数不等于永远最重要，次高计数也不一定是实现最高项的手段。下面通过真实场景和一次小实验核对。</span></section>
    <LifeActionGuide answers={answers} primary={primary} secondary={secondary} names={drives} questions={questions} />
    <section className="ld-drive-cards">
      {main.map((drive) => <article key={drive.key} className="ld-drive-card">
        <div className="ld-drive-card__title"><span>{drive.key}</span><div><small>PRIMARY DRIVE</small><h2>{drive.name}</h2></div></div>
        <blockquote>{drive.line}</blockquote>
        <dl><div><dt>这一需要的含义</dt><dd>{drive.need}</dd></div><div><dt>可核对的充电情境</dt><dd>{drive.charged}</dd></div><div><dt>可核对的耗尽情境</dt><dd>{drive.drained}</dd></div><div><dt>自查提醒 · 并非已发生的判断</dt><dd>{drive.caution}</dd></div></dl>
        <div className="ld-actions"><small>今天可以做</small>{drive.actions.map((action, index) => <p key={action}><b>0{index + 1}</b>{action}</p>)}</div>
      </article>)}
    </section>
    {support.length > 0 && <section className="ld-support"><p>辅助动力</p><div>{support.map((drive) => <article key={drive.key}><span>{drive.key}</span><h3>{drive.name}</h3><p>{drive.line}</p><small>{drive.need}</small></article>)}</div></section>}
    <section className="ld-chart"><p>全部计数</p>{keys.map((key) => <div key={key}><b>{key}</b><span>{drives[key].name}</span><i><em style={{ width: `${max ? (counts[key] / max) * 100 : 0}%` }} /></i><strong>{counts[key]}</strong></div>)}</section>
    <section className="ld-note"><strong>怎么使用这个结果</strong><p>当你突然没有动力，先检查主动力对应的需要是否长期缺席；当你做了很多事却仍不满足，再检查那些行动是否只是看起来正确，却没有回应你的真实需要。</p><small>这是基于 10 次自我选择的反思工具，不是标准化心理测评、人格定型或医学诊断。建议隔半年重测。</small></section>
    <footer className="ld-result__actions"><button onClick={copyResult}>复制结果</button><button onClick={() => window.print()}>保存为 PDF</button><button className="ghost" onClick={restart}>重新测试</button><a href="/">返回 LAB</a></footer>
  </main>;
}

export default function LifeDrive() {
  const saved = (() => { try { return JSON.parse(localStorage.getItem(storageKey) || "[]") as DriveKey[]; } catch { return []; } })();
  const [screen, setScreen] = useState<Screen>(saved.length === questions.length ? "result" : "intro");
  const [index, setIndex] = useState(Math.min(saved.length, questions.length - 1));
  const [answers, setAnswers] = useState<DriveKey[]>(saved);
  const selected = answers[index];
  const question = questions[index];
  const progress = useMemo(() => ((index + 1) / questions.length) * 100, [index]);

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(answers)); }, [answers]);
  useEffect(() => { const previous = document.title; document.title = "生活源动力测试 · 摸鱼之神温迪"; return () => { document.title = previous; }; }, []);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [screen, index]);

  const choose = (key: DriveKey) => setAnswers((current) => { const next = [...current]; next[index] = key; return next.slice(0, questions.length); });
  const next = () => { if (!selected) return; if (index === questions.length - 1) setScreen("result"); else setIndex((value) => value + 1); };
  const restart = () => { localStorage.removeItem(storageKey); setAnswers([]); setIndex(0); setScreen("intro"); };

  if (screen === "result") return <Result answers={answers} restart={restart} />;

  return <main className="ld-shell">
    <header className="ld-top"><a href="/">SELF TEST · 内在动力</a><span>{screen === "intro" ? "01 / 03" : "02 / 03"}</span></header>
    {screen === "intro" && <section className="ld-intro">
      <p className="ld-label">10 道选择题 · 自动计分</p><h1>测测你真正<br />被什么驱动</h1><p className="ld-lead">从最近一年的真实选择出发，找出你反复靠近、也最不愿失去的东西。</p>
      <div className="ld-letters">{keys.map((key) => <span key={key}>{key}<small>{drives[key].name}</small></span>)}</div>
      <div className="ld-how"><div><b>01</b><span>每题只选一个</span></div><div><b>02</b><span>按真实经历回答</span></div><div><b>03</b><span>自动生成解读</span></div></div>
      <button className="ld-primary" onClick={() => setScreen("quiz")}>{answers.length ? "继续上次测试" : "开始测试"}<span>→</span></button><small className="ld-fineprint">结果只保存在当前浏览器 · 不上传个人回答</small>
    </section>}
    {screen === "quiz" && <section className="ld-quiz">
      <div className="ld-progress"><span style={{ width: `${progress}%` }} /></div><p className="ld-question-index">QUESTION · {String(index + 1).padStart(2, "0")} / 10</p><h1>{question.title}</h1>
      <div className="ld-options">{keys.map((key) => <button key={key} className={selected === key ? "selected" : ""} onClick={() => choose(key)}><b>{key}</b><span>{question.options[key]}</span></button>)}</div>
      <footer><button disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>← 上一题</button><button className="ld-primary" disabled={!selected} onClick={next}>{index === questions.length - 1 ? "查看结果" : "下一题"}<span>→</span></button></footer>
    </section>}
  </main>;
}
