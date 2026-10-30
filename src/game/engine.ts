// Entirely local entertainment. Never imports API data, SQK or wallet code.
export const ROUND_MS = 30_000;
export const BEAT_MS = 1_200;
export type Phase = "ready" | "running" | "paused" | "finished";
export type Hit = "perfect" | "good" | "miss" | null;
export type GameState = {
  phase: Phase;
  elapsedMs: number;
  score: number;
  combo: number;
  bestCombo: number;
  perfects: number;
  goods: number;
  misses: number;
  lastAttemptBeat: number;
  lastHit: Hit;
};
export function createGame(): GameState {
  return { phase: "ready", elapsedMs: 0, score: 0, combo: 0,
    bestCombo: 0, perfects: 0, goods: 0, misses: 0,
    lastAttemptBeat: -1, lastHit: null };
}
export function startGame(): GameState { return { ...createGame(), phase: "running" }; }
export function advance(s: GameState, deltaMs: number): GameState {
  if (s.phase !== "running" || !Number.isFinite(deltaMs) || deltaMs <= 0) return s;
  const elapsedMs = Math.min(ROUND_MS, s.elapsedMs + deltaMs);
  const previousBeat = Math.floor(s.elapsedMs / BEAT_MS);
  const currentBeat = Math.floor(elapsedMs / BEAT_MS);
  // Skipping a whole lap breaks a combo; waiting is never rewarded.
  const missedBeat = currentBeat > previousBeat &&
    (s.lastAttemptBeat < previousBeat || currentBeat - previousBeat > 1);
  return { ...s, elapsedMs, combo: missedBeat ? 0 : s.combo,
    phase: elapsedMs >= ROUND_MS ? "finished" : "running" };
}
export function pauseGame(s: GameState): GameState {
  return s.phase === "running" ? { ...s, phase: "paused" } : s;
}
export function resumeGame(s: GameState): GameState {
  return s.phase === "paused" ? { ...s, phase: "running" } : s;
}
export function beatPosition(s: GameState): number {
  return (s.elapsedMs % BEAT_MS) / BEAT_MS;
}
export function attempt(s: GameState): GameState {
  if (s.phase !== "running") return s;
  const beat = Math.floor(s.elapsedMs / BEAT_MS);
  if (s.lastAttemptBeat === beat) return s; // One attempt per lap, no tap spam.
  const distance = Math.abs(beatPosition(s) - 0.5);
  const hit: Hit = distance <= 0.08 ? "perfect" : distance <= 0.20 ? "good" : "miss";
  const combo = hit === "miss" ? 0 : s.combo + 1;
  const awarded = hit === "perfect" ? 100 + Math.min(combo - 1, 10) * 10
    : hit === "good" ? 40 + Math.min(combo - 1, 10) * 5 : 0;
  return { ...s, score: s.score + awarded, combo,
    bestCombo: Math.max(s.bestCombo, combo), lastAttemptBeat: beat, lastHit: hit,
    perfects: s.perfects + Number(hit === "perfect"),
    goods: s.goods + Number(hit === "good"), misses: s.misses + Number(hit === "miss") };
}
