import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, CirclePause, Gamepad2, Play, RotateCcw, Trophy, Zap } from "lucide-react";
import { advance, attempt, beatPosition, createGame, pauseGame, resumeGame, ROUND_MS, startGame, type GameState } from "../game/engine";
import { HamsterWheel } from "./hamster-wheel";

export function WheelGame() {
  const [game, setGame] = useState(createGame);
  const [best, setBest] = useState(0);
  const current = useRef(game);
  const tap = useRef<HTMLButtonElement>(null);
  const update = useCallback((fn: (s: GameState) => GameState) => {
    const next = fn(current.current);
    current.current = next;
    setGame(next);
  }, []);

  useEffect(() => {
    if (game.phase !== "running") return;
    let handle = 0;
    let previous = performance.now();
    const frame = (now: number) => {
      if (current.current.phase !== "running") return;
      if (now - previous >= 32) {
        update(s => advance(s, now - previous));
        previous = now;
      }
      if (current.current.phase === "running") handle = requestAnimationFrame(frame);
    };
    handle = requestAnimationFrame(frame);
    tap.current?.focus({ preventScroll: true });
    if (window.matchMedia("(max-width: 600px)").matches)
      tap.current?.scrollIntoView({ block: "nearest",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    return () => cancelAnimationFrame(handle);
  }, [game.phase, update]);
  useEffect(() => {
    const hidden = () => { if (document.hidden) update(pauseGame); };
    const blur = () => update(pauseGame);
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("blur", blur);
    return () => {
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("blur", blur);
    };
  }, [update]);
  useEffect(() => {
    if (game.phase === "finished") setBest(s => Math.max(s, game.score));
  }, [game.phase, game.score]);

  const togglePause = () => update(s => s.phase === "paused" ? resumeGame(s) : pauseGame(s));
  function keyboard(e: KeyboardEvent<HTMLElement>) {
    const button = (e.target as HTMLElement).closest("button");
    if (button && button !== tap.current) return;
    if (e.code === "Space" || e.code === "ArrowRight") {
      if (current.current.phase !== "running") return;
      e.preventDefault();
      if (!e.repeat) update(attempt);
    } else if (e.code === "KeyP" || e.code === "Escape") {
      if (!["running", "paused"].includes(current.current.phase)) return;
      e.preventDefault();
      if (!e.repeat) togglePause();
    }
  }
  const progress = beatPosition(game);
  const angle = progress * Math.PI * 2 - Math.PI / 2;
  const targetOpen = Math.abs(progress - 0.5) <= 0.2;
  const remaining = Math.ceil((ROUND_MS - game.elapsedMs) / 1000);
  const feedback = game.lastHit === "perfect" ? "Perfect timing!"
    : game.lastHit === "good" ? "Nice spin!" : game.lastHit === "miss"
      ? "Missed the arc — try the next lap." : "Find your rhythm.";
  return (
    <section className="arcade" aria-label="Hamster wheel mini-game" onKeyDown={keyboard}>
      <div className="arcade-disclaimer"><Gamepad2 size={18} />
        <p><strong>Just a game. Every point is fictional.</strong> This wheel earns local game points only. It does not mine blocks, issue SQK, award NFTs or send transactions.</p>
      </div>
      <div className="arcade-grid">
        <section className="panel arcade-play" aria-labelledby="arcade-title">
          <div className="arcade-top"><div><div className="section-kicker">THE TINY PAWS CHALLENGE</div>
            <h2 id="arcade-title">A little rhythm. A lot of heart.</h2></div>
            <span className="pill neutral">30-second sprint</span></div>
          <div className="arcade-stats">
            <div><span>GAME POINTS</span><strong data-testid="game-score">{game.score.toLocaleString("en-US")}<small>pts</small></strong></div>
            <div><span>TIME LEFT</span><strong data-testid="game-time">{remaining}<small>sec</small></strong></div>
            <div><span>COMBO</span><strong data-testid="game-combo">{game.combo}<small>×</small></strong></div>
          </div>
          <div className={`arcade-stage phase-${game.phase}`} data-phase={game.phase}>
            <svg className="arcade-dial" viewBox="0 0 360 360" aria-hidden="true">
              <defs><radialGradient id="arcade-glow"><stop stopColor="var(--accent)" stopOpacity=".13"/><stop offset="1" stopColor="var(--accent)" stopOpacity="0"/></radialGradient></defs>
              <circle cx="180" cy="180" r="168" fill="url(#arcade-glow)"/>
              <circle cx="180" cy="180" r="146" fill="none" stroke="var(--line)" strokeWidth="18"/>
              <path d="M318.9 225.1 A146 146 0 0 1 41.1 225.1" fill="none" stroke="var(--accent)" strokeWidth="18" strokeLinecap="round" opacity=".3"/>
              <path d="M250.3 307.9 A146 146 0 0 1 109.7 307.9" fill="none" stroke="var(--accent)" strokeWidth="18" strokeLinecap="round"/>
              <g transform={`rotate(${progress * 360} 180 180)`} opacity=".25">
                {[0,45,90,135].map(a=><path key={a} d="M180 55V305" transform={`rotate(${a} 180 180)`} stroke="var(--accent)" strokeWidth="1"/>)}
              </g>
              <circle cx={180+146*Math.cos(angle)} cy={180+146*Math.sin(angle)} r="11" fill="var(--text)" stroke="var(--bg)" strokeWidth="4"/>
            </svg>
            <div className="arcade-hamster"><HamsterWheel running={false}/></div>
            <span className="arcade-wheel-label">VIRTUAL WHEEL · LOCAL GAME</span>
            {game.phase !== "running" && <div className="arcade-overlay">
              <span className="arcade-overlay-icon">{game.phase === "finished" ? <Trophy size={25}/> : game.phase === "paused" ? <CirclePause size={25}/> : <Gamepad2 size={25}/>}</span>
              <h3>{game.phase === "finished" ? "Tiny paws. Great effort." : game.phase === "paused" ? "Take a little breather." : "Ready, little runner?"}</h3>
              <p>{game.phase === "finished" ? `${game.score} fictional game points · best combo ${game.bestCombo}×` : game.phase === "paused" ? "The clock is paused. Resume when you are ready." : "Tap once per lap when the dot reaches the green arc."}</p>
              <button className="arcade-primary" onClick={() => update(game.phase === "paused" ? resumeGame : startGame)}>
                <Play size={17}/>{game.phase === "paused" ? "Resume game" : game.phase === "finished" ? "Play again" : "Start game"}
              </button>
            </div>}
          </div>
          <div className={`arcade-cue ${game.phase === "running" && targetOpen ? "open" : ""}`}>
            <span className="status-dot"/>{game.phase === "running" ? targetOpen ? "Green arc — tap now!" : "Wait for the green arc…" : game.phase === "paused" ? "Paused" : game.phase === "finished" ? "Round complete" : "One attempt per lap. Timing beats speed."}
          </div>
          <div className="arcade-feedback" aria-live="polite" aria-atomic="true">{game.phase === "ready" ? "Use touch, a mouse, Space or →. No wallet needed." : feedback}</div>
          <button ref={tap} className="arcade-primary arcade-tap" disabled={game.phase !== "running"} onClick={() => update(attempt)} aria-describedby="arcade-instructions"><Zap size={21}/>Spin!<kbd>SPACE / →</kbd></button>
          <div className="arcade-actions">
            <button className="subtle-button" disabled={!["running","paused"].includes(game.phase)} onClick={togglePause}><CirclePause size={15}/>{game.phase === "paused" ? "Resume" : "Pause"}</button>
            <button className="subtle-button" disabled={game.phase === "ready"} onClick={() => update(createGame)}><RotateCcw size={15}/>Reset game</button>
          </div>
        </section>
        <aside className="arcade-aside">
          <section className="panel arcade-guide" id="arcade-instructions"><div className="section-kicker">SMALL RULES. BIG FUN.</div><h2>Catch the green.</h2>
            <ol><li><span>01</span><p>Start your 30-second round. Watch the dot travel around the wheel.</p></li><li><span>02</span><p>Tap <strong>Spin!</strong>, press <kbd>Space</kbd> or <kbd>→</kbd> while the dot is in the green arc. The brighter center gives a perfect hit.</p></li><li><span>03</span><p>Keep a streak for bonus points. Miss or skip a lap and your combo resets. One attempt per lap keeps it fair.</p></li></ol>
            <p className="arcade-hint">Press <kbd>P</kbd> to pause while the Spin control is focused. Leaving the tab pauses the game automatically.</p>
          </section>
          <section className="panel arcade-session"><Trophy size={23}/><div className="section-kicker">THIS VISIT ONLY</div><h2>Your tiny trophy shelf</h2><strong>{best}<small>best game points</small></strong>
            <div className="arcade-results"><span>Perfect hits<b>{game.perfects}</b></span><span>Good hits<b>{game.goods}</b></span><span>Misses<b>{game.misses}</b></span><span>Best combo<b>{game.bestCombo}×</b></span></div>
            <p>No account or persistent leaderboard. Scores reset when this page is reopened.</p>
          </section>
          <section className="panel arcade-facts"><div className="section-kicker">A CLEAR LINE</div><h2>Play here. Follow the real wheel.</h2><p>This game is an illustration. The real hamster and blockchain data live in the analytics views, sourced only from the official public API.</p><a className="text-link" href="#sources">Check the real sources <ArrowRight size={14}/></a></section>
        </aside>
      </div>
    </section>
  );
}
