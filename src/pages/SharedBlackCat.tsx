import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import petSheet from "@/assets/shared-black-cat/cat-anim-pet.png";
import feedSheet from "@/assets/shared-black-cat/cat-anim-feed.png";
import hugSheet from "@/assets/shared-black-cat/cat-anim-hug.png";
import sitSheet from "@/assets/shared-black-cat/cat-anim-sit.png";
import teaseSheet from "@/assets/shared-black-cat/cat-anim-tease.png";
import "./SharedBlackCat.css";

const API = "https://shared-black-cat.wendiwang233.chatgpt.site";
type Mood = "good" | "tired" | "anxious" | "quiet" | "praise";
type Action = "pet" | "feed" | "hug" | "sit" | "play";
type Interaction = { id: number; actorId: string; kind: "action" | "mood" | "message"; message: string; createdAt: number };
type RoomState = { roomId: string; mood: Mood; moodBy: string; moodLabel: string; memberCount: number; interactions: Interaction[] };

const moods: Array<{ key: Mood; label: string; line: string }> = [
  { key: "good", label: "今天不错", line: "尾巴悄悄翘起来了" },
  { key: "tired", label: "有点累", line: "它想趴一会儿" },
  { key: "anxious", label: "有点焦虑", line: "它缩成小小一团" },
  { key: "quiet", label: "不想说话", line: "安静坐在旁边就好" },
  { key: "praise", label: "想被夸一下", line: "它假装路过镜子" },
];
const actions: Array<{ key: Action; label: string; icon: string }> = [
  { key: "pet", label: "摸摸", icon: "⌁" }, { key: "feed", label: "喂一口", icon: "◇" },
  { key: "hug", label: "抱一下", icon: "♡" }, { key: "sit", label: "陪它发呆", icon: "☕" },
  { key: "play", label: "逗逗它", icon: "✦" },
];
const sheets: Record<Action | "idle", string> = { idle: sitSheet, pet: petSheet, feed: feedSheet, hug: hugSheet, sit: sitSheet, play: teaseSheet };

function cleanRoom(value: string) { return value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 32); }
function memberKey() {
  let value = localStorage.getItem("black-cat-member-id") || "";
  if (!/^[a-f0-9]{32}$/.test(value)) {
    value = crypto.randomUUID().replace(/-/g, "");
    localStorage.setItem("black-cat-member-id", value);
  }
  return value;
}
function ago(time: number) {
  const minutes = Math.max(1, Math.floor((Date.now() - time) / 60000));
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours} 小时前` : `${Math.floor(hours / 24)} 天前`;
}

export default function SharedBlackCat() {
  const [room, setRoom] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [member, setMember] = useState("");
  const [me, setMe] = useState<"a" | "b">("a");
  const [joined, setJoined] = useState(false);
  const [status, setStatus] = useState<"idle" | "joining" | "full" | "error">("idle");
  const [error, setError] = useState("");
  const [state, setState] = useState<RoomState>({ roomId: "", mood: "tired", moodBy: "", moodLabel: "有点累", memberCount: 0, interactions: [] });
  const [motion, setMotion] = useState<Action | "idle">("idle");
  const [motionId, setMotionId] = useState(0);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const mood = useMemo(() => moods.find((item) => item.key === state.mood) || moods[1], [state.mood]);

  const refresh = useCallback(async (targetRoom: string, targetMember: string) => {
    const response = await fetch(`${API}/api/room?room=${encodeURIComponent(targetRoom)}&member=${targetMember}`, { cache: "no-store" });
    if (!response.ok) throw new Error("房间同步失败");
    setState(await response.json() as RoomState);
  }, []);

  useEffect(() => {
    const nextRoom = cleanRoom(new URLSearchParams(location.search).get("room") || "");
    if (!nextRoom) return;
    const nextMember = memberKey();
    setRoom(nextRoom); setRoomInput(nextRoom); setMember(nextMember); setStatus("joining");
    fetch(`${API}/api/room/join`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ room: nextRoom, memberId: nextMember }) })
      .then(async (response) => {
        const data = await response.json() as { slot?: "a" | "b"; error?: string; code?: string };
        if (!response.ok || !data.slot) throw Object.assign(new Error(data.error || "暂时进不了房间"), { full: data.code === "ROOM_FULL" });
        setMe(data.slot); setJoined(true); setStatus("idle"); await refresh(nextRoom, nextMember);
      })
      .catch((reason: Error & { full?: boolean }) => { setStatus(reason.full ? "full" : "error"); setError(reason.message); });
  }, [refresh]);

  useEffect(() => {
    if (!joined) return;
    const interval = window.setInterval(() => void refresh(room, member).catch(() => undefined), 5000);
    return () => window.clearInterval(interval);
  }, [joined, member, refresh, room]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); void audio.current?.close(); }, []);

  const enter = (event: FormEvent) => {
    event.preventDefault(); const value = cleanRoom(roomInput);
    if (value.length < 3) { setError("房间号至少要有 3 位"); return; }
    location.assign(`/shared-black-cat/?room=${encodeURIComponent(value)}`);
  };
  const randomRoom = () => {
    const value = new Uint32Array(1); crypto.getRandomValues(value);
    location.assign(`/shared-black-cat/?room=${100000 + value[0] % 900000}`);
  };
  const post = async (kind: "action" | "mood" | "message", value: string) => {
    setSending(true);
    try {
      const response = await fetch(`${API}/api/room`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ room, memberId: member, kind, value }) });
      if (!response.ok) throw new Error("保存失败"); setState(await response.json() as RoomState);
    } finally { setSending(false); }
  };
  const act = (key: Action) => {
    setMotion(key); setMotionId((id) => id + 1); if (timer.current) clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMotion("idle"), key === "hug" ? 3600 : 2800);
    void post("action", key);
  };
  const leaveNote = (event: FormEvent) => { event.preventDefault(); const value = note.trim(); if (!value) return; setNote(""); void post("message", value); };
  const copyInvite = () => navigator.clipboard.writeText(`${location.origin}/shared-black-cat/?room=${room}`);
  const toggleSound = () => {
    if (audio.current) { void audio.current.close(); audio.current = null; setSoundOn(false); return; }
    const context = new AudioContext(); const now = context.currentTime;
    [261.63, 329.63, 392].forEach((frequency, index) => { const o = context.createOscillator(); const g = context.createGain(); o.type = "sine"; o.frequency.value = frequency; g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime(.05, now + .08 + index * .08); g.gain.exponentialRampToValueAtTime(.0001, now + 2.6); o.connect(g).connect(context.destination); o.start(now + index * .12); o.stop(now + 2.7); });
    audio.current = context; setSoundOn(true);
  };

  if (!joined) return <main className="black-cat-page cat-lobby"><section className="cat-lobby-card">
    <div className="cat-logo">●</div><span className="cat-eyebrow">两个人的小房间</span><h1>去找那只黑猫</h1>
    <p>输入同一个房间号，就能看到同一只猫。每间房只留两张位置。</p>
    {status === "joining" && <div className="cat-joining">正在推开房门…</div>}
    {status === "full" && <div className="cat-full"><strong>房间已经满了</strong><span>{error}</span></div>}
    <form onSubmit={enter} className="cat-room-form"><label htmlFor="cat-room">房间号</label><div><input id="cat-room" value={roomInput} onChange={(event) => { setRoomInput(cleanRoom(event.target.value)); setError(""); }} placeholder="例如 204618" /><button>进入</button></div>{error && status !== "full" && <small>{error}</small>}</form>
    <button className="cat-random" onClick={randomRoom}>✦ 随机生成一个 6 位房间号</button><a href="/">返回 Windy Lab</a>
  </section></main>;

  return <main className="black-cat-page">
    <header className="cat-topbar"><a href="/shared-black-cat/" className="cat-brand"><span>●</span>有只黑猫</a><div className="cat-room-status">房间 {room} · {state.memberCount}/2</div><div><button onClick={toggleSound}>{soundOn ? "声音开着" : "开启声音"}</button><button onClick={() => void copyInvite()}>复制邀请</button></div></header>
    <section className="cat-layout"><div className="cat-main-card"><div className="cat-scene"><span className="cat-moon" /><p>☾ 今晚，窗边很安静</p><div key={`${motion}-${motionId}`} className={`cat-sprite cat-${motion} mood-${state.mood}`} style={{ backgroundImage: `url(${sheets[motion]})` }} />
      <div className="cat-mood-note"><small>{state.moodBy === me ? "你留给它的状态" : "对方留给它的状态"}</small><strong>{state.moodLabel}</strong><span>{mood.line}</span></div></div>
      <div className="cat-controls"><div className="cat-controls-title"><div><span className="cat-eyebrow">十几秒就好</span><h1>现在，想怎么陪它？</h1></div><select value={state.mood} onChange={(event) => void post("mood", event.target.value)} aria-label="选择今天的状态">{moods.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></div>
        <div className="cat-actions">{actions.map((action) => <button key={action.key} onClick={() => act(action.key)} disabled={sending}><span>{action.icon}</span>{action.label}</button>)}</div></div></div>
      <aside className="cat-history"><div><span className="cat-eyebrow">这间屋子里</span><h2>最近来过</h2></div><ol>{state.interactions.map((item) => <li key={item.id}><span /><div><p><strong>{item.actorId === me ? "你" : "对方"}</strong>{item.message}</p><time>{ago(item.createdAt)}</time></div></li>)}</ol>
        <form onSubmit={leaveNote} className="cat-note"><label htmlFor="cat-note">给对方留一句话</label><div><input id="cat-note" value={note} onChange={(event) => setNote(event.target.value.slice(0, 80))} maxLength={80} placeholder="最多 80 个字" /><button disabled={!note.trim() || sending}>留下</button></div></form><p className="cat-privacy">这里没有在线状态，也不会提醒谁很久没来。</p></aside>
    </section>
  </main>;
}
