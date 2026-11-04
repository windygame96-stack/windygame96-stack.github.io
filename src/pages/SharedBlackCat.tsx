import { tr } from "@/lib/subpage-language";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import petSheet from "@/assets/shared-black-cat/cat-anim-pet.png";
import feedSheet from "@/assets/shared-black-cat/cat-anim-feed.png";
import hugSheet from "@/assets/shared-black-cat/cat-anim-hug.png";
import sitSheet from "@/assets/shared-black-cat/cat-anim-sit.png";
import teaseSheet from "@/assets/shared-black-cat/cat-anim-tease.png";
import "./SharedBlackCat.css";
const API = "https://api.escapefromhongye.xyz";
type Mood = "good" | "tired" | "anxious" | "quiet" | "praise";
type Action = "pet" | "feed" | "hug" | "sit" | "play";
type Interaction = {
  id: number;
  actorId: string;
  kind: "action" | "mood" | "message";
  message: string;
  createdAt: number;
};
type RoomState = {
  roomId: string;
  mood: Mood;
  moodBy: string;
  moodLabel: string;
  memberCount: number;
  interactions: Interaction[];
};
const moods: Array<{
  key: Mood;
  label: string;
  line: string;
}> = [{
  key: "good",
  label: "今天不错",
  line: "尾巴悄悄翘起来了"
}, {
  key: "tired",
  label: "有点累",
  line: "它想趴一会儿"
}, {
  key: "anxious",
  label: "有点焦虑",
  line: "它缩成小小一团"
}, {
  key: "quiet",
  label: "不想说话",
  line: "安静坐在旁边就好"
}, {
  key: "praise",
  label: "想被夸一下",
  line: "它假装路过镜子"
}];
const actions: Array<{
  key: Action;
  label: string;
  icon: string;
}> = [{
  key: "pet",
  label: "摸摸",
  icon: "⌁"
}, {
  key: "feed",
  label: "喂一口",
  icon: "◇"
}, {
  key: "hug",
  label: "抱一下",
  icon: "♡"
}, {
  key: "sit",
  label: "陪它发呆",
  icon: "☕"
}, {
  key: "play",
  label: "逗逗它",
  icon: "✦"
}];
const sheets: Record<Action | "idle", string> = {
  idle: sitSheet,
  pet: petSheet,
  feed: feedSheet,
  hug: hugSheet,
  sit: sitSheet,
  play: teaseSheet
};
function cleanRoom(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 32);
}
function memberKey() {
  let value = localStorage.getItem("black-cat-member-id") || "";
  if (!/^[a-f0-9]{32}$/.test(value)) {
    value = typeof crypto.randomUUID === "function" ? crypto.randomUUID().replace(/-/g, "") : Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, "0")).join("");
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
  const [state, setState] = useState<RoomState>({
    roomId: "",
    mood: "tired",
    moodBy: "",
    moodLabel: "有点累",
    memberCount: 0,
    interactions: []
  });
  const [motion, setMotion] = useState<Action | "idle">("idle");
  const [motionId, setMotionId] = useState(0);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const mood = useMemo(() => moods.find(item => item.key === state.mood) || moods[1], [state.mood]);
  const refresh = useCallback(async (targetRoom: string, targetMember: string) => {
    const response = await fetch(`${API}/api/room?room=${encodeURIComponent(targetRoom)}&member=${targetMember}`, {
      cache: "no-store"
    });
    if (!response.ok) throw new Error("房间同步失败");
    setState((await response.json()) as RoomState);
  }, []);
  useEffect(() => {
    const nextRoom = cleanRoom(new URLSearchParams(location.search).get("room") || "");
    if (!nextRoom) return;
    const nextMember = memberKey();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    setRoom(nextRoom);
    setRoomInput(nextRoom);
    setMember(nextMember);
    setStatus("joining");
    fetch(`${API}/api/room/join`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        room: nextRoom,
        memberId: nextMember
      }),
      signal: controller.signal
    }).then(async response => {
      const data = (await response.json()) as {
        slot?: "a" | "b";
        error?: string;
        code?: string;
      };
      if (!response.ok || !data.slot) throw Object.assign(new Error(data.error || "暂时进不了房间"), {
        full: data.code === "ROOM_FULL"
      });
      setMe(data.slot);
      setJoined(true);
      setStatus("idle");
      void refresh(nextRoom, nextMember).catch(() => undefined);
    }).catch((reason: Error & {
      full?: boolean;
    }) => {
      setStatus(reason.full ? "full" : "error");
      setError(reason.name === "AbortError" ? "房间连接有点慢，请再试一次。" : reason.message);
    }).finally(() => window.clearTimeout(timeout));
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [refresh]);
  useEffect(() => {
    if (!joined) return;
    const interval = window.setInterval(() => void refresh(room, member).catch(() => undefined), 5000);
    return () => window.clearInterval(interval);
  }, [joined, member, refresh, room]);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    void audio.current?.close();
  }, []);
  const enter = (event: FormEvent) => {
    event.preventDefault();
    const value = cleanRoom(roomInput);
    if (value.length < 3) {
      setError("房间号至少要有 3 位");
      return;
    }
    location.assign(`/shared-black-cat/?room=${encodeURIComponent(value)}`);
  };
  const randomRoom = () => {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    location.assign(`/shared-black-cat/?room=${100000 + value[0] % 900000}`);
  };
  const post = async (kind: "action" | "mood" | "message", value: string) => {
    setSending(true);
    try {
      const response = await fetch(`${API}/api/room`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          room,
          memberId: member,
          kind,
          value
        })
      });
      if (!response.ok) throw new Error("保存失败");
      setState((await response.json()) as RoomState);
    } finally {
      setSending(false);
    }
  };
  const act = (key: Action) => {
    setMotion(key);
    setMotionId(id => id + 1);
    if (timer.current) clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMotion("idle"), key === "hug" ? 3600 : 2800);
    void post("action", key);
  };
  const leaveNote = (event: FormEvent) => {
    event.preventDefault();
    const value = note.trim();
    if (!value) return;
    setNote("");
    void post("message", value);
  };
  const copyInvite = () => navigator.clipboard.writeText(`${location.origin}/shared-black-cat/?room=${room}`);
  const toggleSound = () => {
    if (audio.current) {
      void audio.current.close();
      audio.current = null;
      setSoundOn(false);
      return;
    }
    const context = new AudioContext();
    const now = context.currentTime;
    [261.63, 329.63, 392].forEach((frequency, index) => {
      const o = context.createOscillator();
      const g = context.createGain();
      o.type = "sine";
      o.frequency.value = frequency;
      g.gain.setValueAtTime(.0001, now);
      g.gain.exponentialRampToValueAtTime(.05, now + .08 + index * .08);
      g.gain.exponentialRampToValueAtTime(.0001, now + 2.6);
      o.connect(g).connect(context.destination);
      o.start(now + index * .12);
      o.stop(now + 2.7);
    });
    audio.current = context;
    setSoundOn(true);
  };
  if (!joined) return <main className="black-cat-page cat-lobby"><section className="cat-lobby-card">
    <div className="cat-logo">●</div><span className="cat-eyebrow">{tr("\u4E24\u4E2A\u4EBA\u7684\u5C0F\u623F\u95F4")}</span><h1>{tr("\u53BB\u627E\u90A3\u53EA\u9ED1\u732B")}</h1>
    <p>{tr("\u8F93\u5165\u540C\u4E00\u4E2A\u623F\u95F4\u53F7\uFF0C\u5C31\u80FD\u770B\u5230\u540C\u4E00\u53EA\u732B\u3002\u6BCF\u95F4\u623F\u53EA\u7559\u4E24\u5F20\u4F4D\u7F6E\u3002")}</p>
    {tr(status === "joining" && <div className="cat-joining">{tr("\u6B63\u5728\u63A8\u5F00\u623F\u95E8\u2026")}</div>)}
    {tr(status === "full" && <div className="cat-full"><strong>{tr("\u623F\u95F4\u5DF2\u7ECF\u6EE1\u4E86")}</strong><span>{tr(error)}</span></div>)}
    <form onSubmit={enter} className="cat-room-form"><label htmlFor="cat-room">{tr("\u623F\u95F4\u53F7")}</label><div><input id="cat-room" value={roomInput} onChange={event => {
            setRoomInput(cleanRoom(event.target.value));
            setError("");
          }} placeholder={tr("例如 204618")} /><button>{tr("\u8FDB\u5165")}</button></div>{tr(error && status !== "full" && <small>{tr(error)}</small>)}</form>
    <button className="cat-random" onClick={randomRoom}>{tr("\u2726 \u968F\u673A\u751F\u6210\u4E00\u4E2A 6 \u4F4D\u623F\u95F4\u53F7")}</button><a href="/">{tr("\u8FD4\u56DE Windy Lab")}</a>
  </section></main>;
  return <main className="black-cat-page">
    <header className="cat-topbar"><a href="/shared-black-cat/" className="cat-brand"><span>●</span>{tr("\u6709\u53EA\u9ED1\u732B")}</a><div className="cat-room-status">{tr("\u623F\u95F4")}{tr(room)} · {tr(state.memberCount)}/2</div><div><button onClick={toggleSound}>{tr(soundOn ? "声音开着" : "开启声音")}</button><button onClick={() => void copyInvite()}>{tr("\u590D\u5236\u9080\u8BF7")}</button></div></header>
    <section className="cat-layout"><div className="cat-main-card"><div className="cat-scene"><span className="cat-moon" /><p>{tr("\u263E \u4ECA\u665A\uFF0C\u7A97\u8FB9\u5F88\u5B89\u9759")}</p><div key={`${motion}-${motionId}`} className={`cat-sprite cat-${motion} mood-${state.mood}`} style={{
            backgroundImage: `url(${sheets[motion]})`
          }} />
      <div className="cat-mood-note"><small>{tr(state.moodBy === me ? "你留给它的状态" : "对方留给它的状态")}</small><strong>{tr(state.moodLabel)}</strong><span>{tr(mood.line)}</span></div></div>
      <div className="cat-controls"><div className="cat-controls-title"><div><span className="cat-eyebrow">{tr("\u5341\u51E0\u79D2\u5C31\u597D")}</span><h1>{tr("\u73B0\u5728\uFF0C\u60F3\u600E\u4E48\u966A\u5B83\uFF1F")}</h1></div><select value={state.mood} onChange={event => void post("mood", event.target.value)} aria-label="选择今天的状态">{tr(moods.map(item => <option key={item.key} value={item.key}>{tr(item.label)}</option>))}</select></div>
        <div className="cat-actions">{tr(actions.map(action => <button key={action.key} onClick={() => act(action.key)} disabled={sending}><span>{tr(action.icon)}</span>{tr(action.label)}</button>))}</div></div></div>
      <aside className="cat-history"><div><span className="cat-eyebrow">{tr("\u8FD9\u95F4\u5C4B\u5B50\u91CC")}</span><h2>{tr("\u6700\u8FD1\u6765\u8FC7")}</h2></div><ol>{tr(state.interactions.map(item => <li key={item.id}><span /><div><p><strong>{tr(item.actorId === me ? "你" : "对方")}</strong><span data-user-content={item.kind === 'message' ? 'true' : undefined}>{item.message}</span></p><time>{tr(ago(item.createdAt))}</time></div></li>))}</ol>
        <form onSubmit={leaveNote} className="cat-note"><label htmlFor="cat-note">{tr("\u7ED9\u5BF9\u65B9\u7559\u4E00\u53E5\u8BDD")}</label><div><input id="cat-note" value={note} onChange={event => setNote(event.target.value.slice(0, 80))} maxLength={80} placeholder="最多 80 个字" /><button disabled={!note.trim() || sending}>{tr("\u7559\u4E0B")}</button></div></form><p className="cat-privacy">{tr("\u8FD9\u91CC\u6CA1\u6709\u5728\u7EBF\u72B6\u6001\uFF0C\u4E5F\u4E0D\u4F1A\u63D0\u9192\u8C01\u5F88\u4E45\u6CA1\u6765\u3002")}</p></aside>
    </section>
  </main>;
}
