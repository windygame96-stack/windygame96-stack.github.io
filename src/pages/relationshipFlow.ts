import { relationshipQuestions as questions } from "./relationshipQuestions";
import type { RelationshipAnswer, RelationshipProfile } from "./relationshipGuidance";

export const FLOW_VERSION = "rf-2.0";
export const FLOW_STORAGE_KEY = "rf-session-v2";
export const SAVE_TTL = 7 * 24 * 60 * 60 * 1000;
export type Screen = "intro" | "quiz" | "review" | "handoff" | "report";
export type Session = { screen: Screen; mode: "solo" | "pair"; stage: "pre_relationship" | "partnered"; profiles: RelationshipProfile[]; person: number; index: number };
export const newProfile = (name: string): RelationshipProfile => ({ name, answers: {}, followups: {} });
export const initialSession = (): Session => ({ screen: "intro", mode: "solo", stage: "pre_relationship", profiles: [newProfile("你")], person: 0, index: 0 });
export const blankAnswer = (): RelationshipAnswer => ({ option: -1, importance: "unknown", flexibility: "unknown", basis: "unknown", note: "" });
export function answered(profile: RelationshipProfile, id: string) { const a = profile.answers[id]; return !!a && Number.isInteger(a.option) && a.option >= 0 && a.option < 4; }
export function validSession(value: unknown): value is Session {
  if (!value || typeof value !== "object") return false;
  const v = value as Session;
  if (!["intro", "quiz", "review", "handoff", "report"].includes(v.screen) || !["solo", "pair"].includes(v.mode) || !["pre_relationship", "partnered"].includes(v.stage)) return false;
  if (!Array.isArray(v.profiles) || !v.profiles.length || v.profiles.length > 2 || (v.mode === "solo" && v.profiles.length !== 1)) return false;
  if (!Number.isInteger(v.person) || v.person < 0 || v.person >= v.profiles.length || !Number.isInteger(v.index) || v.index < 0 || v.index >= questions.length) return false;
  if (v.screen === "handoff" && (v.mode !== "pair" || v.person !== 0 || v.profiles.length !== 1)) return false;
  if (v.screen === "report" && v.mode === "pair" && v.profiles.length !== 2) return false;
  return v.profiles.every((p) => {
    if (!p || !["你", "A", "B"].includes(p.name) || !p.answers || typeof p.answers !== "object" || !p.followups || typeof p.followups !== "object" || Object.keys(p.followups).length) return false;
    let important = 0;
    for (const [id, a] of Object.entries(p.answers)) {
      if (!questions.some((q) => q.id === id) || !a || !Number.isInteger(a.option) || a.option < -1 || a.option > 3 || !["unknown", "high"].includes(a.importance) || !["unknown", "willing", "conditional", "unwilling"].includes(a.flexibility) || !["unknown", "experience", "hypothesis"].includes(a.basis) || a.note !== "") return false;
      if (a.importance === "high") { if (a.option < 0) return false; important++; }
    }
    return important <= 3;
  });
}
export function decodeSession(raw: string | null, now = Date.now()): Session | null {
  try {
    const saved = JSON.parse(raw || "null");
    if (!saved || saved.version !== FLOW_VERSION || !Number.isFinite(saved.expiresAt) || !Number.isFinite(saved.savedAt) || saved.savedAt > now || saved.expiresAt <= now || saved.expiresAt - saved.savedAt > SAVE_TTL || !validSession(saved.session)) return null;
    return saved.session;
  } catch { return null; }
}
export function encodeSession(session: Session, savedAt: number, expiresAt = savedAt + SAVE_TTL) { return JSON.stringify({ version: FLOW_VERSION, savedAt, expiresAt, session }); }
