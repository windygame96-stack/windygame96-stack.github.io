import { useEffect, useRef, useState } from "react";
import "./RelationshipFit.css";
import RelationshipReport from "./RelationshipReport";
import { relationshipQuestions as questions } from "./relationshipQuestions";
import { answered, blankAnswer, decodeSession, encodeSession, FLOW_STORAGE_KEY, initialSession, newProfile, SAVE_TTL, type Session } from "./relationshipFlow";
import type { RelationshipAnswer, RelationshipProfile } from "./relationshipGuidance";

function readSaved() { try { const raw = localStorage.getItem(FLOW_STORAGE_KEY); const valid = decodeSession(raw); if (raw && !valid) localStorage.removeItem(FLOW_STORAGE_KEY); return valid; } catch { return null; } }
function readLegacy(): RelationshipProfile[] | null {
  try {
    if (JSON.parse(localStorage.getItem("rf-screen") || "null") !== "report") return null;
    const profiles = JSON.parse(localStorage.getItem("rf-profiles") || "null") as RelationshipProfile[];
    if (!Array.isArray(profiles) || !profiles.length || profiles.length > 2) return null;
    return profiles.every((p) => p && typeof p.name === "string" && p.answers && p.followups && questions.every((q) => {
      const a = p.answers[q.id];
      return a && answered(p, q.id) && ["low", "medium", "high"].includes(a.importance) && ["willing", "conditional", "unwilling"].includes(a.flexibility) && ["experience", "hypothesis"].includes(a.basis) && typeof a.note === "string" && (!p.followups[q.id] || typeof p.followups[q.id] === "string");
    })) ? profiles : null;
  } catch { return null; }
}

export default function RelationshipFit() {
  const [restorable, setRestorable] = useState(readSaved);
  const [legacy, setLegacy] = useState(readLegacy);
  const [legacyView, setLegacyView] = useState(false);
  const [legacyStage] = useState<"pre_relationship" | "partnered">(() => { try { return JSON.parse(localStorage.getItem("rf-stage") || "null") === "partnered" ? "partnered" : "pre_relationship"; } catch { return "pre_relationship"; } });
  const [session, setSession] = useState<Session>(initialSession);
  const [persist, setPersist] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [savedUntil, setSavedUntil] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const current = session.profiles[session.person];
  const question = questions[session.index];
  const currentAnswer = current.answers[question.id] || blankAnswer();
  const completed = questions.filter((q) => answered(current, q.id)).length;
  const important = questions.filter((q) => current.answers[q.id]?.importance === "high");

  useEffect(() => {
    const oldTitle = document.title; document.title = "亲密关系说明书 · 简化版";
    return () => { document.title = oldTitle; timers.current.forEach(clearTimeout); };
  }, []);
  useEffect(() => { window.scrollTo({ top: 0 }); heading.current?.focus(); }, [session.screen, session.index, session.person]);
  useEffect(() => {
    if (!persist || !savedUntil) return;
    if (savedUntil <= Date.now()) { try { localStorage.removeItem(FLOW_STORAGE_KEY); } catch { /* unavailable */ } setPersist(false); setSavedUntil(null); return; }
    try { localStorage.setItem(FLOW_STORAGE_KEY, encodeSession(session, savedUntil - SAVE_TTL, savedUntil)); setSaveError(false); } catch { setSaveError(true); }
  }, [session, persist, savedUntil]);

  function updateAnswer(id: string, patch: Partial<RelationshipAnswer>) {
    setSession((s) => ({ ...s, profiles: s.profiles.map((p, i) => i !== s.person ? p : { ...p, answers: { ...p.answers, [id]: { ...(p.answers[id] || blankAnswer()), ...patch } } }) }));
  }
  function choose(option: number) {
    if (lock.current) return;
    lock.current = true; setBusy(true);
    updateAnswer(question.id, option < 0 ? blankAnswer() : { option });
    timers.current.push(setTimeout(() => {
      setSession((s) => ({ ...s, index: editing ? s.index : Math.min(s.index + 1, questions.length - 1), screen: editing || s.index === questions.length - 1 ? "review" : "quiz" }));
      setEditing(false);
      timers.current.push(setTimeout(() => { lock.current = false; setBusy(false); }, 180));
    }, 180));
  }
  function begin() {
    setSession((s) => ({ ...initialSession(), mode: s.mode, stage: s.stage, screen: "quiz", profiles: [newProfile(s.mode === "pair" ? "A" : "你")] }));
  }
  function edit(index: number) { setEditing(true); setSession((s) => ({ ...s, index, screen: "quiz" })); }
  function togglePriority(id: string) {
    if (current.answers[id]?.importance === "high") updateAnswer(id, { importance: "unknown", flexibility: "unknown", basis: "unknown" });
    else if (important.length < 3) updateAnswer(id, { importance: "high" });
  }
  function setSaving(checked: boolean) {
    setPersist(checked); setSaveError(false);
    if (checked) setSavedUntil(Date.now() + SAVE_TTL);
    else { setSavedUntil(null); setRestorable(null); try { localStorage.removeItem(FLOW_STORAGE_KEY); } catch { setSaveError(true); } }
  }
  function clear() {
    for (const key of [FLOW_STORAGE_KEY, "rf-screen", "rf-mode", "rf-stage", "rf-profiles"]) { try { localStorage.removeItem(key); } catch { /* unavailable */ } }
    setPersist(false); setSavedUntil(null); setRestorable(null); setLegacy(null); setLegacyView(false); setEditing(false); setSession(initialSession());
  }
  const savingControl = <div className="rf-saving"><label><input type="checkbox" checked={persist} onChange={(e) => setSaving(e.target.checked)} />在这台设备保留进度 7 天（可选）</label>{persist && <small>到期不再读取；取消勾选或点击“清除本机数据”可立即删除。</small>}{saveError && <p role="status">无法操作本机存储，本次仍可继续；共享设备请使用浏览器设置清除网站数据。</p>}<button onClick={clear}>清除本机数据</button></div>;

  if (legacyView && legacy) return <><div className="rf-legacy-bar">这是旧版已完成的回答，不会被当作新版答案。<button onClick={() => setLegacyView(false)}>返回简化版</button></div><RelationshipReport profiles={legacy} questions={questions} stage={legacyStage} onReset={clear} />{savingControl}</>;
  if (session.screen === "report") return <><RelationshipReport profiles={session.profiles} questions={questions} stage={session.stage} onReset={clear} onEdit={() => setSession((s) => ({ ...s, screen: "review" }))} /><div className="rf-saving-footer">{savingControl}</div></>;

  return <main className="rf-shell rf-simple">
    <a className="rf-brand" href="/tests/"><span>RF</span> 测试实验室</a>
    {session.screen === "intro" && <section className="rf-intro">
      <p className="rf-kicker">12 题 · 只需点选</p><h1 ref={heading} tabIndex={-1}>亲密关系，<br /><i>先看懂自己。</i></h1>
      <p className="rf-intro__lead">看清你希望怎样相处，带走可以直接开口的建议。预计 3–5 分钟。</p>
      <div className="rf-mode-grid"><button aria-pressed={session.mode === "solo"} className={session.mode === "solo" ? "active" : ""} onClick={() => setSession((s) => ({ ...s, mode: "solo" }))}><strong>自己测</strong><span>整理自己的相处偏好</span></button><button aria-pressed={session.mode === "pair"} className={session.mode === "pair" ? "active" : ""} onClick={() => setSession((s) => ({ ...s, mode: "pair" }))}><strong>两个人测</strong><span>同一设备轮流回答</span></button></div>
      <p className="rf-intro-hint">回想最近一年的相处经历；没经历过就按期待选，也可以跳过。每题点一下就继续，不用写字。</p>
      <button className="rf-primary" onClick={begin}>开始点选 →</button>
      {restorable && <button className="rf-focus-button" onClick={() => { setSession(restorable); setPersist(true); try { const value = JSON.parse(localStorage.getItem(FLOW_STORAGE_KEY) || "null"); setSavedUntil(value.expiresAt); } catch { setSaving(true); } }}>继续已保存的简化版{restorable.screen === "report" ? "报告" : "进度"}</button>}
      {legacy && <button className="rf-focus-button" onClick={() => setLegacyView(true)}>查看旧版报告</button>}
      <small>仅供自我探索，面向成年人；不是心理诊断或关系成败预测。</small>
      <details className="rf-privacy-details"><summary>答案和隐私</summary><p>默认只在本次页面里处理答案，刷新后清空；需要保留时可自愿保存 7 天。没有姓名、联系方式或文字经历填写，不上传答案。托管服务可能记录访问日志。</p><p>两人模式会在双方完成后展示共同选项和差异；交接时隐藏上一人的答案。共享设备仍应谨慎使用。</p></details>
      {savingControl}
    </section>}

    {session.screen === "quiz" && <section className="rf-quiz">
      <header><span>{session.mode === "pair" ? `${current.name} 独立回答` : "你的相处偏好"}</span><b>第 {session.index + 1} / 12 题</b></header><div className="rf-progress"><i style={{ width: `${(session.index + 1) / 12 * 100}%` }} /></div>
      <h1 ref={heading} tabIndex={-1}>{question.text}</h1><p className="rf-question-hint">选最接近你的一个，点选后自动继续。</p>
      <div className="rf-options">{question.options.map((option, index) => <button key={option} disabled={busy} aria-pressed={currentAnswer.option === index} className={currentAnswer.option === index ? "active" : ""} onKeyDown={(e) => { if (e.repeat) e.preventDefault(); }} onClick={() => choose(index)}><span>{String.fromCharCode(65 + index)}</span>{option}{currentAnswer.option === index && <b aria-hidden="true">✓</b>}</button>)}</div>
      <footer><button disabled={busy || (session.index === 0 && !editing)} onClick={() => editing ? setSession((s) => ({ ...s, screen: "review" })) : setSession((s) => ({ ...s, index: s.index - 1 }))}>{editing ? "← 返回复核" : "← 上一题"}</button><button className="rf-skip" disabled={busy} onClick={() => choose(-1)}>没想好，跳过 →</button></footer>
      <small className="rf-answer-count" aria-live="polite">已回答 {completed} 题 · 尚未回答 {12 - completed} 题</small>
    </section>}

    {session.screen === "review" && <section className="rf-review">
      <p className="rf-kicker">{session.mode === "pair" ? `${current.name} · ` : ""}最后看一眼</p><h1 ref={heading} tabIndex={-1}>选完就能看报告。</h1><p>已答 {completed} / 12 题。不用逐题确认；想改哪题，点“修改”即可。</p>
      <div className="rf-review-actions"><button className="rf-primary" disabled={busy} onClick={() => setSession((s) => ({ ...s, screen: s.mode === "pair" && s.person === 0 ? "handoff" : "report" }))}>{session.mode === "pair" && session.person === 0 ? "完成，交给 B →" : "查看说明书 →"}</button><span>也可以先在下面选 1–3 个在意的话题（可跳过）。</span></div>
      <div className="rf-review-list">{questions.map((q, index) => <div key={q.id}><div><strong>{q.short}</strong><span>{answered(current, q.id) ? q.options[current.answers[q.id].option] : "已跳过，报告不作判断"}</span></div><button onClick={() => edit(index)} aria-label={`修改${q.short}`}>修改</button></div>)}</div>
      <details className="rf-priorities"><summary>让建议更贴近你：选在意的话题（可选）</summary><p>最多 3 项，只影响报告的阅读顺序；不选也能生成报告。</p><div className="rf-priority-chips">{questions.filter((q) => answered(current, q.id)).map((q) => <button key={q.id} aria-pressed={current.answers[q.id].importance === "high"} disabled={important.length >= 3 && current.answers[q.id].importance !== "high"} onClick={() => togglePriority(q.id)}>{current.answers[q.id].importance === "high" ? "✓ " : ""}{q.short}</button>)}</div>
      {important.length > 0 && <details className="rf-optional"><summary>只为这 {important.length} 项补充边界和依据（可选）</summary>{important.map((q) => <fieldset key={q.id}><legend>{q.short}</legend><p>这项做法你愿意调整吗？</p><div className="rf-priority-chips">{([['unknown', '暂不补充'], ['willing', '愿意商量'], ['conditional', '看条件'], ['unwilling', '不愿调整']] as const).map(([key, text]) => <button key={key} aria-pressed={current.answers[q.id].flexibility === key} onClick={() => updateAnswer(q.id, { flexibility: key })}>{text}</button>)}</div><p>这个选择主要来自？</p><div className="rf-priority-chips">{([['unknown', '暂不补充'], ['experience', '实际经历'], ['hypothesis', '当前期待']] as const).map(([key, text]) => <button key={key} aria-pressed={current.answers[q.id].basis === key} onClick={() => updateAnswer(q.id, { basis: key })}>{text}</button>)}</div></fieldset>)}</details>}</details>
      {session.mode === "pair" && session.person === 1 && <div className="rf-stage"><span>报告侧重</span><button aria-pressed={session.stage === "pre_relationship"} onClick={() => setSession((s) => ({ ...s, stage: "pre_relationship" }))}>确定关系前</button><button aria-pressed={session.stage === "partnered"} onClick={() => setSession((s) => ({ ...s, stage: "partnered" }))}>已经在一起</button></div>}
      {savingControl}
    </section>}

    {session.screen === "handoff" && <section className="rf-handoff"><p className="rf-kicker">A 已完成</p><h1 ref={heading} tabIndex={-1}>现在交给 B。</h1><p>A 的选择已隐藏。B 独立完成后，会生成双方都可看的报告。</p><button className="rf-primary" onClick={() => setSession((s) => ({ ...s, profiles: [s.profiles[0], newProfile("B")], person: 1, index: 0, screen: "quiz" }))}>我是 B，开始 →</button></section>}
  </main>;
}
