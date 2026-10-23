import { useState } from "react";

type Key = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
type Plan = { setup: string; action: string; observe: string; adjust: string; question: string };
const plans: Record<Key, Plan> = {
  A: { setup: "选一项本周本来就要做、但做法可以协商的小任务。", action: "和相关人确认交付结果及时间，把完成方式留给自己；在日程上安排两次 30 分钟的不受打扰时间。", observe: "每次结束写一句：有选择权后，是否更愿意开始？协作有没有被耽误？", adjust: "如果仍没动力，检查任务本身是否有意义、工作量是否可承受；不要只继续争取更多独处时间。", question: "我缺的是决定方式的自由，还是根本不想承担这项任务？" },
  B: { setup: "选一个具体的微技能，先留下一份当前水平的样本。", action: "本周练习三次，每次 20 分钟；每次只改进一个细节，最后用同一标准再做一份样本。", observe: "对比前后样本：能否指出一项具体进步？练习后是更有兴趣，还是更疲惫？", adjust: "看不到进步时先缩小难度或寻求具体反馈；练习加重疲劳时减少时长，不把休息当退步。", question: "我真的想掌握它，还是只怕自己落后？" },
  C: { setup: "挑一个你在意的想法，缩成两小时内可以完成的版本。", action: "本周分两次把它做成可见的小作品，提前定义完成标准，例如一页文字或一个可点击原型；可以只自己保存。", observe: "记录完成一版后是否满足，以及吸引你的是表达、完成，还是他人的反馈。", adjust: "如果开头有劲、收尾乏力，把范围再减半；若只有被认可才满足，再检查成就需要。", question: "这次想做出的东西是什么，做到哪里就算完成？" },
  D: { setup: "选一个新主题或新场景，给探索留两次各 30 分钟的时间。", action: "每次只带着一个问题探索，结束后写下一个发现，以及是否值得继续；先保留现有重要安排。", observe: "新鲜感过去后，还想继续了解吗？探索有没有留下可以使用的发现？", adjust: "如果只想不断换题，停一次，问自己是在好奇还是在逃避当前困难，再决定继续或收尾。", question: "如果没人知道我探索过，这个问题还值得我花时间吗？" },
  E: { setup: "选一个你愿意接近、也愿意回应你的人，先询问对方是否方便。", action: "本周安排一次 30 分钟交流，各讲一件最近真实发生的事，并说清此刻希望倾听还是建议；对方不方便就另约。", observe: "交流后能否更放松、更敢表达？有没有为了维持气氛答应本不想做的事？", adjust: "没有回应时先确认时机和双方需要，不靠增加付出来换回应；可以寻找其他可靠支持。", question: "这段连接让我可以做自己，还是让我更怕说不？" },
  F: { setup: "找一个明确受益者，先确认对方需要什么，以及你能投入多少。", action: "本周只提供一次不超过 45 分钟的具体帮助，结束后询问哪部分有用、哪部分没用，不包办后续。", observe: "是否发生了可描述的改善？你得到满足还是承担了额外负担？", adjust: "没有帮助时改成先询问需要；超出精力时缩小范围，不通过继续承担来证明价值。", question: "对方真的需要这份帮助吗？我是否可以在边界内提供？" },
  G: { setup: "选一个一周内能完成、主要由自己控制的目标。", action: "用一句话写出完成标准，拆成三步，今天做第一步；提前决定什么时候检查，完成后留十分钟记录成果。", observe: "清楚的终点是否让你更容易行动？完成后有满足感，还是马上觉得不够？", adjust: "目标完成仍空虚时，回看目标是否自己在意；不要自动加码或把外部评价当作唯一反馈。", question: "如果没有排名和表扬，我还想完成这个目标吗？" },
  H: { setup: "列出一个本周最打乱生活、同时可以调整的不确定因素。", action: "选一个小安排先稳定七天，例如固定收尾时间或提前核对一项支出；为可能的变动写一条备用方案。", observe: "是否减少了临时应对？稳定后是否更有余力做想做的事，还是只是更忙于检查？", adjust: "若计划越做越多，把它减成下一步和一个备用方案；一次只改变一处，不追求消除所有风险。", question: "我需要多少准备才足够开始？哪些不确定其实可以承受？" },
};

const pairNotes: Record<string, string> = {
  AH: "自主与安全同时出现时，可以先保留稳定安排，在可承受的时间与花费内试一项自己决定的小变化，再决定是否扩大。",
  AD: "自主与探索同时出现时，可以自主选一个新主题，但为它设一个收尾时间，确认自由探索是否真的留下满足感。",
  AC: "自主与创造同时出现时，可以自己选作品和做法，同时把完成范围写小，避免只有自由却迟迟没有落地。",
  BC: "精进与创造同时出现时，可以用一件小作品承载一项技能练习，分别检查能力是否进步、作品是否完成。",
  BG: "精进与成就同时出现时，可以同时记录能力变化与交付结果；结果暂时不好，不等于能力没有增长。",
  CD: "创造与探索同时出现时，可以先探索，再将一个发现做成小作品，给搜集素材设定停止时间。",
  DH: "探索与安全同时出现时，可以把新尝试限定在可撤回、花费可控的范围内；先体验，再决定要不要改变长期安排。",
  EF: "归属与贡献同时出现时，可以在关系中提供一次有边界的帮助，也留一次不以帮忙为目的的交流，检查连接是否必须靠付出来维持。",
  FG: "贡献与成就同时出现时，可以为一项真实帮助设完成标准，分别核对受益者是否得到改善，以及目标是否完成。",
};

export default function LifeActionGuide({ answers, primary, secondary, names, questions }: { answers: Key[]; primary: Key[]; secondary: Key[]; names: Record<Key, { name: string }>; questions: { title: string; options: Record<Key, string> }[] }) {
  const [focus, setFocus] = useState<Key>(() => { try { const value = JSON.parse(localStorage.getItem("life-drive-plan-v2") || "null"); return value?.answers === answers.join("") && primary.includes(value.focus) ? value.focus : primary[0]; } catch { return primary[0]; } });
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [done, setDone] = useState(false);
  const plan = plans[focus];
  const evidence = answers.map((key, index) => ({ key, index })).filter((row) => row.key === focus);
  const partner = primary.length === 2 ? primary.find((key) => key !== focus) : secondary.length === 1 ? secondary[0] : undefined;
  const pairKey = partner ? [focus, partner].sort().join("") : "";
  const [reflection, setReflection] = useState(() => { try { const value = JSON.parse(localStorage.getItem("life-drive-plan-v2") || "null"); return value?.answers === answers.join("") ? String(value.reflection || "") : ""; } catch { return ""; } });
  function save() {
    try { localStorage.setItem("life-drive-plan-v2", JSON.stringify({ answers: answers.join(""), focus, reflection, savedAt: new Date().toISOString() })); setSaved(true); setSaveError(false); } catch { setSaved(false); setSaveError(true); }
  }

  return <section className="ld-guidance">
    <p>让结果变成一次小尝试</p><h2>{primary.length > 1 ? "有并列，不必急着选出唯一答案" : "先挑一件，验证它是否真的有帮助"}</h2>
    <p>计数说明你在这些题里更常选了什么，不能单独证明你最近缺什么。{primary.length > 1 ? "并列时先选目前最想照顾的一项，其他需要仍然成立。" : "先把下面的解释和最近一件真实小事对照。"}</p>
    <label>这周先关注<select value={focus} onChange={(e) => { setFocus(e.target.value as Key); setSaved(false); setDone(false); }}>{primary.map((key) => <option value={key} key={key}>{names[key].name}</option>)}</select></label>
    <div className="ld-proof"><h3>为什么出现「{names[focus].name}」</h3><p>你有 {evidence.length} 次选择对应这一项：</p>{evidence.map(({ index }) => <div key={index}><small>第 {index + 1} 题 · {questions[index].title}</small><strong>{questions[index].options[focus]}</strong></div>)}<p>先核对：{plan.question}</p></div>
    <div className="ld-combination"><h3>放在一起怎么用</h3><p>{pairNotes[pairKey] || (partner ? `这次${names[focus].name}与${names[partner].name}都较突出。先按下面的方案照顾${names[focus].name}，再问自己：有没有挤占${names[partner].name}所需要的时间和条件？由你确认这两种需要是否能在同一次安排中得到照顾。` : "目前无法从计数确定唯一的组合。先照顾一项需要，再检查其他需要有没有被挤占，不为所有并列项一次安排满整周。")}</p></div>
    {answers[6] !== answers[9] && <div className="ld-combination"><h3>一个值得核对的不同选择</h3><p>第 7 题你愿意承担的代价对应「{names[answers[6]].name}」，第 10 题无人评价时的选择对应「{names[answers[9]].name}」。这不代表矛盾或虚伪，可以回想：它们分别发生在什么场景，哪一个现在更需要空间？</p></div>}
    <div className="ld-experiment"><h3>一周小实验 · {names[focus].name}</h3><dl><div><dt>先选场景</dt><dd>{plan.setup}</dd></div><div><dt>具体怎么做</dt><dd>{plan.action}</dd></div><div><dt>怎样判断有用</dt><dd>{plan.observe}</dd></div><div><dt>没效果怎么改</dt><dd>{plan.adjust}</dd></div></dl>
      <label>把它改成你自己的安排<textarea value={reflection} maxLength={1000} onChange={(e) => { setReflection(e.target.value); setSaved(false); }} placeholder="我准备在____时间，做____。我会观察____。一周后保留或调整____。" /></label>
      <button onClick={save}>{saved ? "已保存到本机" : "保存我的安排"}</button><button onClick={() => setDone(!done)} aria-expanded={done}>{done ? "收起复盘问题" : "一周后，用这三个问题复盘"}</button>
      {saveError && <p role="status">当前浏览器无法保存，可以复制文字或打印保留。</p>}
      {done && <ol><li>实际做了什么？如果没做，卡在时间、条件还是不想做？</li><li>哪个具体时刻更有劲或更轻松？有没有额外代价？</li><li>下周保留什么、缩小什么，还是换一个需要再试？</li></ol>}
    </div>
  </section>;
}
