import { tr } from "@/lib/subpage-language";
import { useEffect, useState } from "react";
import "./TestsHub.css";
type TestStatus = {
  label: string;
  detail: string;
  active: boolean;
};
function readLifeDriveStatus(): TestStatus {
  try {
    const answers = JSON.parse(localStorage.getItem("life-drive-answers-v1") || "[]") as string[];
    if (answers.length >= 10) return {
      label: "查看结果",
      detail: "已完成 10 / 10",
      active: true
    };
    if (answers.length > 0) return {
      label: "继续测试",
      detail: `已完成 ${answers.length} / 10`,
      active: true
    };
  } catch {/* use default */}
  return {
    label: "开始测试",
    detail: "约 3 分钟",
    active: false
  };
}
function readRelationshipStatus(): TestStatus {
  try {
    const screen = JSON.parse(localStorage.getItem("rf-screen") || '"intro"') as string;
    if (screen === "report") return {
      label: "查看报告",
      detail: "已有本机报告",
      active: true
    };
    if (screen !== "intro") return {
      label: "继续测试",
      detail: "发现未完成进度",
      active: true
    };
  } catch {/* use default */}
  return {
    label: "开始测试",
    detail: "约 6 分钟",
    active: false
  };
}
export default function TestsHub() {
  const [lifeStatus] = useState(readLifeDriveStatus);
  const [relationshipStatus] = useState(readRelationshipStatus);
  useEffect(() => {
    const previous = document.title;
    document.title = tr("测试实验室 · 摸鱼之神温迪");
    return () => {
      document.title = tr(previous);
    };
  }, []);
  return <main className="th-shell">
    <header className="th-nav"><a href="/">WENDI'S LAB</a><span>SELF TESTS · 02</span></header>
    <section className="th-hero">
      <p>TESTS · FOR CONVERSATION</p>
      <h1>{tr("\u6709\u4E9B\u95EE\u9898\uFF0C")}<br /><i>{tr("\u503C\u5F97\u8BA4\u771F\u95EE\u81EA\u5DF1\u3002")}</i></h1>
      <div><span>{tr("\u8FD9\u91CC\u6CA1\u6709\u547D\u8FD0\u5224\u51B3\uFF0C\u4E5F\u6CA1\u6709\u5FC3\u7406\u8BCA\u65AD\u3002")}</span><span>{tr("\u53EA\u6709\u4E00\u7EC4\u95EE\u9898\uFF0C\u5E2E\u4F60\u628A\u6A21\u7CCA\u611F\u53D7\u53D8\u6210\u53EF\u4EE5\u8BA8\u8BBA\u7684\u8BED\u8A00\u3002")}</span></div>
    </section>
    <section className="th-grid">
      <a className="th-card th-card--drive" href="/life-drive/">
        <header><span>01</span><small>SELF · MOTIVATION</small></header>
        <div className="th-card__letters"><b>A</b><b>B</b><b>C</b><b>D</b><b>E</b><b>F</b><b>G</b><b>H</b></div>
        <div className="th-card__body"><p>{tr("\u4ECE\u6700\u8FD1\u4E00\u5E74\u7684\u771F\u5B9E\u9009\u62E9\u51FA\u53D1")}</p><h2>{tr("\u751F\u6D3B\u6E90\u52A8\u529B\u6D4B\u8BD5")}</h2><span>{tr("\u8BC6\u522B\u4F60\u5F53\u524D\u6700\u9700\u8981\u7684\u81EA\u4E3B\u3001\u7CBE\u8FDB\u3001\u521B\u9020\u3001\u63A2\u7D22\u3001\u5F52\u5C5E\u3001\u8D21\u732E\u3001\u6210\u5C31\u6216\u5B89\u5168\u3002")}</span></div>
        <footer><div><strong>{tr(lifeStatus.label)}</strong><small className={lifeStatus.active ? "active" : ""}>{tr(lifeStatus.detail)}</small></div><b>→</b></footer>
      </a>
      <a className="th-card th-card--relationship" href="/relationship-fit/">
        <header><span>02</span><small>SELF · RELATIONSHIP</small></header>
        <div className="th-card__diagram"><span>{tr("\u9700\u6C42")}</span><i /><span>{tr("\u8FB9\u754C")}</span><i /><span>{tr("\u534F\u5546")}</span></div>
        <div className="th-card__body"><p>{tr("\u5728\u786E\u5B9A\u5173\u7CFB\u4E4B\u524D\uFF0C\u8BA4\u771F\u804A\u4E00\u6B21")}</p><h2>{tr("\u5173\u7CFB\u4F7F\u7528\u8BF4\u660E\u4E66")}</h2><span>{tr("\u6574\u7406\u4EB2\u5BC6\u5173\u7CFB\u4E2D\u7684\u9700\u6C42\u3001\u8FB9\u754C\u548C\u53EF\u534F\u5546\u6761\u4EF6\uFF0C\u4E5F\u53EF\u4EE5\u4E24\u4E2A\u4EBA\u8F6E\u6D41\u5B8C\u6210\u8BA8\u8BBA\u5730\u56FE\u3002")}</span></div>
        <footer><div><strong>{tr(relationshipStatus.label)}</strong><small className={relationshipStatus.active ? "active" : ""}>{tr(relationshipStatus.detail)}</small></div><b>→</b></footer>
      </a>
    </section>
    <section className="th-compare">
      <p>{tr("\u600E\u4E48\u9009\u62E9")}</p>
      <div><span>{tr("\u60F3\u7406\u89E3\u201C\u6211\u4E3A\u4EC0\u4E48\u6709\u52B2\u6216\u6CA1\u52B2\u201D")}</span><strong>{tr("\u5148\u505A\u751F\u6D3B\u6E90\u52A8\u529B")}</strong></div>
      <div><span>{tr("\u60F3\u7406\u89E3\u201C\u6211\u5728\u5173\u7CFB\u91CC\u9700\u8981\u4EC0\u4E48\u201D")}</span><strong>{tr("\u5148\u505A\u5173\u7CFB\u4F7F\u7528\u8BF4\u660E\u4E66")}</strong></div>
      <div><span>{tr("\u60F3\u66F4\u5B8C\u6574\u5730\u8BA4\u8BC6\u5F53\u524D\u7684\u81EA\u5DF1")}</span><strong>{tr("\u4E24\u4E2A\u90FD\u505A\uFF0C\u7ED3\u679C\u5206\u5F00\u7406\u89E3")}</strong></div>
    </section>
    <section className="th-privacy"><strong>{tr("\u7B54\u6848\u5C5E\u4E8E\u4F60")}</strong><p>{tr("\u4E24\u4E2A\u6D4B\u8BD5\u90FD\u628A\u8FDB\u5EA6\u548C\u7B54\u6848\u4FDD\u5B58\u5728\u5F53\u524D\u6D4F\u89C8\u5668\uFF0C\u4E0D\u4E0A\u4F20\u670D\u52A1\u5668\u3002\u6362\u8BBE\u5907\u6216\u6E05\u9664\u6D4F\u89C8\u5668\u6570\u636E\u540E\uFF0C\u672C\u5730\u7ED3\u679C\u4E0D\u4F1A\u81EA\u52A8\u540C\u6B65\u3002")}</p></section>
    <footer className="th-footer"><a href="/">{tr("\u2190 \u8FD4\u56DE\u6478\u9C7C\u4E4B\u795E\u6E29\u8FEA\u7684 LAB")}</a><span>02 TESTS · MORE LATER</span></footer>
  </main>;
}
