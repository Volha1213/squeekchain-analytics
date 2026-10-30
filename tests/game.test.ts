import assert from "node:assert/strict";
import { test } from "node:test";
import { advance, attempt, BEAT_MS, createGame, pauseGame, resumeGame, ROUND_MS, startGame } from "../src/game/engine";

test("ready, paused and finished games cannot award points", () => {
  for (const s of [createGame(), pauseGame(startGame()), advance(startGame(), ROUND_MS)])
    assert.deepEqual(attempt(s), s);
});
test("timing earns points, a miss breaks the combo, and one lap permits one attempt", () => {
  const first = attempt(advance(startGame(), BEAT_MS / 2));
  assert.equal(first.lastHit, "perfect"); assert.equal(first.score, 100);
  assert.deepEqual(attempt(advance(first, 20)), advance(first, 20));
  const second = attempt(advance(first, BEAT_MS));
  assert.equal(second.score, 210); assert.equal(second.combo, 2);
  const miss = attempt(advance(second, BEAT_MS / 2 + 10));
  assert.equal(miss.lastHit, "miss"); assert.equal(miss.score, 210);
  assert.equal(miss.combo, 0); assert.equal(miss.bestCombo, 2);
});
test("a good attempt awards less than perfect, and an unplayed lap breaks a combo", () => {
  const good = attempt(advance(startGame(), BEAT_MS * 0.35));
  assert.equal(good.lastHit, "good"); assert.equal(good.score, 40);
  const skipped = advance(good, BEAT_MS * 2);
  assert.equal(skipped.combo, 0); assert.equal(skipped.score, 40);
});
test("pause freezes both clock and score; resume continues; reset is independent", () => {
  const s = attempt(advance(startGame(), 600));
  const paused = pauseGame(s);
  assert.deepEqual(advance(paused, 60000), paused);
  assert.deepEqual(attempt(paused), paused);
  assert.equal(advance(resumeGame(paused), 200).elapsedMs, 800);
  assert.equal(startGame().score, 0); assert.equal(createGame().phase, "ready");
});
test("the real elapsed duration ends the round and invalid clock deltas are ignored", () => {
  const s = startGame();
  for (const delta of [NaN, Infinity, -5, 0]) assert.deepEqual(advance(s, delta), s);
  const end = advance(s, ROUND_MS + 5000);
  assert.equal(end.elapsedMs, ROUND_MS); assert.equal(end.phase, "finished");
  assert.equal(end.score, 0);
});
