import { useEffect, useRef, useState, type ComponentType, type FormEvent } from "react";
import { verifyRelationshipPasscode } from "./relationshipAccess";
import "./RelationshipGate.css";

export default function RelationshipGate() {
  const [Test, setTest] = useState<ComponentType | null>(null);
  const [view, setView] = useState<"guide" | "check">("guide");
  const [checkOpened, setCheckOpened] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const locked = useRef(false);
  useEffect(() => { if (!Test) document.title = "访问密码 · 亲密关系说明书"; }, [Test]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true; setBusy(true); setError(""); setLoadFailed(false);
    try {
      const valid = await verifyRelationshipPasscode(password);
      setPassword("");
      if (!valid) { setError("密码不对，请再试一次。"); input.current?.focus(); return; }
      try {
        const module = await import("./RelationshipFit");
        setTest(() => module.default);
      } catch {
        setLoadFailed(true); setError("页面加载失败，请重新加载后再试。密码没有保存。");
      }
    } catch (e) {
      setPassword(""); setError(e instanceof Error ? e.message : "暂时无法验证，请稍后重试。");
    } finally { locked.current = false; setBusy(false); }
  }
  if (Test) return <>
    <nav className="rf-test-nav" aria-label="关系测试">
      <button type="button" aria-pressed={view === "guide"} onClick={() => setView("guide")}>亲密关系说明书</button>
      <button type="button" aria-pressed={view === "check"} onClick={() => {
        setCheckOpened(true);
        setView("check");
        window.scrollTo(0, 0);
      }}>心动之后 · 10题</button>
      <button type="button" className="rf-test-nav__lock" onClick={() => window.location.reload()}>锁定页面</button>
    </nav>
    <div hidden={view !== "guide"}><Test /></div>
    {checkOpened && <iframe
      id="rf-heart-check"
      className="rf-heart-check"
      hidden={view !== "check"}
      src="/relationship-fit/heart-check/"
      title="心动之后 · 恋爱关系投入测试"
    />}
  </>;
  return <main className="rf-entry">
    <a href="/tests/" className="rf-entry-back">← 测试实验室</a>
    <section className="rf-entry-card">
      <span className="rf-entry-mark" aria-hidden="true">♡</span>
      <p>亲密关系说明书</p><h1>输入密码，<br />打开关系测试。</h1>
      <span>12题整理自己的相处偏好，也可以用「心动之后」的10道题，看看这段关系值得投入多少。</span>
      <form onSubmit={submit}>
        <label htmlFor="rf-entry-password">访问密码</label>
        <input id="rf-entry-password" ref={input} type="password" inputMode="numeric" maxLength={4} autoComplete="off" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="4 位数字密码" disabled={busy} aria-describedby={error ? "rf-entry-error" : undefined} />
        {error && <p role="alert" id="rf-entry-error">{error}</p>}
        <button type="submit" disabled={busy || password.length !== 4}>{busy ? "正在打开…" : "进入测试 →"}</button>
      </form>
      {loadFailed && <button className="rf-entry-retry" onClick={() => window.location.reload()}>重新加载页面</button>}
      <small>密码不会保存，刷新或关闭后需重新输入。</small>
    </section>
  </main>;
}
