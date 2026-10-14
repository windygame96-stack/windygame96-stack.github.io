import { useEffect, useState } from "react";
import "./TestsHub.css";

type TestStatus = { label: string; detail: string; active: boolean };

function readLifeDriveStatus(): TestStatus {
  try {
    const answers = JSON.parse(localStorage.getItem("life-drive-answers-v1") || "[]") as string[];
    if (answers.length >= 10) return { label: "查看结果", detail: "已完成 10 / 10", active: true };
    if (answers.length > 0) return { label: "继续测试", detail: `已完成 ${answers.length} / 10`, active: true };
  } catch { /* use default */ }
  return { label: "开始测试", detail: "约 3 分钟", active: false };
}

function readRelationshipStatus(): TestStatus {
  try {
    const screen = JSON.parse(localStorage.getItem("rf-screen") || '"intro"') as string;
    if (screen === "report") return { label: "查看报告", detail: "已有本机报告", active: true };
    if (screen !== "intro") return { label: "继续测试", detail: "发现未完成进度", active: true };
  } catch { /* use default */ }
  return { label: "开始测试", detail: "约 6 分钟", active: false };
}

export default function TestsHub() {
  const [lifeStatus] = useState(readLifeDriveStatus);
  const [relationshipStatus] = useState(readRelationshipStatus);

  useEffect(() => {
    const previous = document.title;
    document.title = "测试实验室 · 摸鱼之神温迪";
    return () => { document.title = previous; };
  }, []);

  return <main className="th-shell">
    <header className="th-nav"><a href="/">WENDI'S LAB</a><span>SELF TESTS · 02</span></header>
    <section className="th-hero">
      <p>TESTS · FOR CONVERSATION</p>
      <h1>有些问题，<br /><i>值得认真问自己。</i></h1>
      <div><span>这里没有命运判决，也没有心理诊断。</span><span>只有一组问题，帮你把模糊感受变成可以讨论的语言。</span></div>
    </section>
    <section className="th-grid">
      <a className="th-card th-card--drive" href="/life-drive/">
        <header><span>01</span><small>SELF · MOTIVATION</small></header>
        <div className="th-card__letters"><b>A</b><b>B</b><b>C</b><b>D</b><b>E</b><b>F</b><b>G</b><b>H</b></div>
        <div className="th-card__body"><p>从最近一年的真实选择出发</p><h2>生活源动力测试</h2><span>识别你当前最需要的自主、精进、创造、探索、归属、贡献、成就或安全。</span></div>
        <footer><div><strong>{lifeStatus.label}</strong><small className={lifeStatus.active ? "active" : ""}>{lifeStatus.detail}</small></div><b>→</b></footer>
      </a>
      <a className="th-card th-card--relationship" href="/relationship-fit/">
        <header><span>02</span><small>SELF · RELATIONSHIP</small></header>
        <div className="th-card__diagram"><span>需求</span><i /><span>边界</span><i /><span>协商</span></div>
        <div className="th-card__body"><p>在确定关系之前，认真聊一次</p><h2>关系使用说明书</h2><span>整理亲密关系中的需求、边界和可协商条件，也可以两个人轮流完成讨论地图。</span></div>
        <footer><div><strong>{relationshipStatus.label}</strong><small className={relationshipStatus.active ? "active" : ""}>{relationshipStatus.detail}</small></div><b>→</b></footer>
      </a>
    </section>
    <section className="th-compare">
      <p>怎么选择</p>
      <div><span>想理解“我为什么有劲或没劲”</span><strong>先做生活源动力</strong></div>
      <div><span>想理解“我在关系里需要什么”</span><strong>先做关系使用说明书</strong></div>
      <div><span>想更完整地认识当前的自己</span><strong>两个都做，结果分开理解</strong></div>
    </section>
    <section className="th-privacy"><strong>答案属于你</strong><p>两个测试都把进度和答案保存在当前浏览器，不上传服务器。换设备或清除浏览器数据后，本地结果不会自动同步。</p></section>
    <footer className="th-footer"><a href="/">← 返回摸鱼之神温迪的 LAB</a><span>02 TESTS · MORE LATER</span></footer>
  </main>;
}
