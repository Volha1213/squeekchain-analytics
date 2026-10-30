"use client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Box,
  Check,
  CircleHelp,
  CirclePause,
  Coins,
  Database,
  ExternalLink,
  Fingerprint,
  Gauge,
  Heart,
  LayoutDashboard,
  Menu,
  Moon,
  Network,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sun,
  Timer,
  X,
  Zap,
} from "lucide-react";
import { AnalyticsChart } from "./chart";
import { buildPoints, type Metric } from "@/lib/chart-data";
import { HamsterWheel } from "./hamster-wheel";
import { useAnalytics } from "./use-analytics";
import {
  compactToken,
  dateTime,
  integer,
  percent,
  reasonText,
  shortHash,
  token,
} from "@/lib/format";
import type { Analytics, Range, SourceResult, Stats } from "@/lib/types";

type View = "overview" | "wheel" | "blocks" | "sqk" | "sources";
const navigation: { id: View; title: string; icon: typeof Activity }[] = [
  { id: "overview", title: "Overview", icon: LayoutDashboard },
  { id: "wheel", title: "Wheel activity", icon: Activity },
  { id: "blocks", title: "Blocks", icon: Box },
  { id: "sqk", title: "SQK economy", icon: Coins },
  { id: "sources", title: "Data sources", icon: Database },
];
const titles: Record<View, [string, string]> = {
  overview: [
    "Small paws. Real work.",
    "A closer look at the world's hamster-powered blockchain.",
  ],
  wheel: [
    "Every little revolution.",
    "Follow Squeektoshi's measured wheel activity and accepted work.",
  ],
  blocks: [
    "From wheel to chain.",
    "Explore Squeek blocks settled on Ethereum Sepolia.",
  ],
  sqk: [
    "The SQK economy.",
    "Supply, issuance and staking, straight from the public API.",
  ],
  sources: [
    "Follow the evidence.",
    "Know where every number comes from and what it can tell you.",
  ],
};
function Logo({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand-mark ${small ? "small" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path
          d="M9 10 6 6l2-3 6 4h4l6-4 2 3-3 4c4 4 4 10-1 14-3 3-9 3-12 0-5-4-5-10-1-14Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="m11 15 2 1m8-1-2 1m-5 4 2 2 2-2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
function Pill({
  children,
  tone = "green",
}: {
  children: ReactNode;
  tone?: "green" | "amber" | "neutral";
}) {
  return (
    <span className={`pill ${tone}`}>
      <span className="status-dot" />
      {children}
    </span>
  );
}
function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="empty-state">
      <Database size={23} />
      <span>{children}</span>
    </div>
  );
}
function MetricCard({
  title,
  value,
  unit,
  caption,
  icon: Icon,
  loading,
  accent = false,
  detail,
}: {
  title: string;
  value: string;
  unit?: string;
  caption: string;
  icon: typeof Activity;
  loading: boolean;
  accent?: boolean;
  detail?: string;
}) {
  return (
    <article className={`metric-card ${accent ? "featured" : ""}`}>
      <div className="metric-top">
        <span>{title}</span>
        <Icon size={17} />
      </div>
      <div
        className={`metric-value ${loading && value === "—" ? "skeleton" : ""}`}
        title={detail}
      >
        {value}
        {unit && <span>{unit}</span>}
      </div>
      <div className="metric-caption">
        <span className="tiny-dot" />
        {caption}
      </div>
    </article>
  );
}
function SourceLink({ url, children }: { url: string; children: ReactNode }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" className="text-link">
      {children}
      <ArrowUpRight size={13} />
    </a>
  );
}

export function Dashboard() {
  const [view, setView] = useState<View>("overview");
  const [range, setRange] = useState<Range>("7d");
  const [auto, setAuto] = useState(true);
  const [light, setLight] = useState(false);
  const [menu, setMenu] = useState(false);
  const [metric, setMetric] = useState<Metric>("blocks");
  const [table, setTable] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const { data, loading, error, refresh } = useAnalytics(range, auto);
  useEffect(() => {
    setLight(localStorage.getItem("squeek-theme") === "light");
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = light ? "light" : "dark";
    localStorage.setItem("squeek-theme", light ? "light" : "dark");
  }, [light]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const sync = () => {
      const v = location.hash.slice(1);
      if (navigation.some((n) => n.id === v)) setView(v as View);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  function navigate(next: View) {
    setView(next);
    if (next === "wheel" && range === "24h") setRange("7d");
    setMenu(false);
    window.history.replaceState(null, "", `#${next}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const core = data?.core.data?.status === "available" ? data.core.data : null;
  const economy =
    data?.economy.data?.status === "available" ? data.economy.data : null;
  const settlements =
    data?.settlements.data?.status === "available"
      ? data.settlements.data
      : null;
  const stats = data?.stats.data ?? null;
  const measurement = data?.pipeline.data?.measurement;
  const online =
    !!measurement &&
    measurement.freshness === "online" &&
    now - Date.parse(measurement.receivedAt) <=
      measurement.staleAfterSeconds * 1000 &&
    !error;
  const running =
    online && measurement.coreStatus === "ACTIVE" && measurement.rpmMilli > 0;
  const fault = online && measurement.coreStatus === "COUNTER_FAULT";
  const projected =
    data?.pipeline.data?.builder.status === "available"
      ? data.pipeline.data.builder.projected
      : null;
  const wheel = view === "wheel";
  const effectiveMetric = view === "sqk" ? "sqk" : metric;
  const points = useMemo(
    () => buildPoints(data, effectiveMetric, wheel),
    [data, effectiveMetric, wheel],
  );
  const unit =
    wheel || effectiveMetric === "work"
      ? "work units"
      : effectiveMetric === "blocks"
        ? "blocks / hour"
        : "SQK";
  const chartTitle = wheel
    ? "Wheel activity"
    : view === "sqk"
      ? "SQK issuance"
      : "Network activity";
  const mintPercent = economy
    ? percent(economy.supply.liveSupplyBaseUnits, economy.supply.capBaseUnits)
    : null;
  const checked = data
    ? Math.max(0, Math.floor((now - Date.parse(data.fetchedAt)) / 1000))
    : null;
  const sourceCount = data
    ? [
        data.pipeline,
        data.core,
        data.economy,
        data.settlements,
        data.stats,
      ].filter((s) => s.state === "available").length
    : 0;
  const sourceProblem = !!data && sourceCount < 5;

  function exportCsv() {
    const rows = [
      ["period_utc", unit, "coverage"],
      ...points.map((p) => [
        p.fullLabel,
        p.value == null ? "unavailable" : String(p.value),
        p.coverage ?? "API settlement buckets",
      ]),
    ];
    const content = rows
      .map((r) => r.map((v) => `"${v.replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `squeekchain-${wheel ? "wheel" : effectiveMetric}-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app-shell">
      {menu && (
        <button
          className="menu-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <a
          href="#overview"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            navigate("overview");
          }}
        >
          <Logo />
          <span>
            squeekchain<small>ANALYTICS</small>
          </span>
        </a>
        <button
          className="mobile-close icon-button"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        >
          <X size={20} />
        </button>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {navigation.map(({ id, title, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(id);
              }}
              className={`nav-item ${view === id ? "active" : ""}`}
              aria-current={view === id ? "page" : undefined}
            >
              <Icon size={18} />
              {title}
              {id === "overview" && <span className="nav-active-dot" />}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="built-card">
            <span className="built-icon">
              <Zap size={17} />
            </span>
            <strong>Powered by tiny paws.</strong>
            <p>
              Physical work.
              <br />
              Onchain proof.
            </p>
            <a
              href="https://docs.squeekchain.com"
              target="_blank"
              rel="noreferrer"
            >
              Explore Squeekchain
              <ArrowUpRight size={14} />
            </a>
          </div>
          <a
            className="sidebar-docs"
            href="https://docs.squeekchain.com/developers/api/"
            target="_blank"
            rel="noreferrer"
          >
            <BookOpen size={16} />
            Developer docs
            <ExternalLink size={12} />
          </a>
          <div className="sidebar-version">
            <span className="status-dot" />
            Sepolia testnet<span>v1.0</span>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              onClick={() => setMenu(true)}
            >
              <Menu size={20} />
            </button>
            <span className="breadcrumb-root">Workspace</span>
            <span className="slash">/</span>
            <strong>{navigation.find((n) => n.id === view)?.title}</strong>
          </div>
          <div className="topbar-actions">
            <span className="testnet-tag">
              <span className="ethereum-diamond">◇</span>Ethereum Sepolia
            </span>
            <a
              href="https://docs.squeekchain.com"
              className="top-docs"
              target="_blank"
              rel="noreferrer"
            >
              Docs
              <ArrowUpRight size={13} />
            </a>
            <span className="topbar-divider" />
            <button
              className="icon-button"
              onClick={() => setLight((v) => !v)}
              aria-label={
                light ? "Switch to dark theme" : "Switch to light theme"
              }
            >
              {light ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>
        <main id="main-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span /> SQUEEKCHAIN EXPLORER
              </div>
              <h1>{titles[view][0]}</h1>
              <p>{titles[view][1]}</p>
            </div>
            <div className="refresh-group">
              <button
                className={`live-button ${auto ? "enabled" : ""}`}
                onClick={() => setAuto((v) => !v)}
                aria-pressed={auto}
              >
                {auto ? <Radio size={14} /> : <CirclePause size={14} />}{" "}
                {auto ? "Auto-refresh on" : "Auto-refresh off"}
              </button>
              <button
                className="icon-button refresh-button"
                disabled={loading}
                onClick={() => void refresh()}
                aria-label="Refresh data"
              >
                <RefreshCw size={16} className={loading ? "spin" : ""} />
              </button>
            </div>
          </div>
          <div className="environment-note">
            <span>
              <span className="testnet-mini">TESTNET</span>Real hamster. Real
              data. Sepolia SQK has no monetary value.
            </span>
            <button onClick={() => navigate("sources")}>
              About the data
              <ArrowUpRight size={13} />
            </button>
          </div>
          {error && (
            <div className="notice error-notice" role="alert">
              {error}
              <button onClick={() => void refresh()}>
                Retry
                <RefreshCw size={13} />
              </button>
            </div>
          )}
          {sourceProblem && !loading && (
            <div className="notice" role="status">
              {sourceCount} of 5 sources available. Some metrics are
              unavailable.
              <button onClick={() => navigate("sources")}>
                View source status
                <ArrowRight size={13} />
              </button>
            </div>
          )}
          {data?.settlements.sourceMode === "durable-cache" && (
            <div className="notice" role="status">
              Settlement history is a cached upstream snapshot; the indexer may
              be behind.
              <button onClick={() => navigate("sources")}>
                Snapshot details
                <ArrowRight size={13} />
              </button>
            </div>
          )}
          {data?.deployment.mismatch && (
            <div className="deployment-note">
              <Fingerprint size={13} />
              <span>
                API deployment differs from the documentation record checked{" "}
                {data.deployment.checkedAt}.
              </span>
              <button onClick={() => navigate("sources")}>
                Details
                <ArrowUpRight size={12} />
              </button>
            </div>
          )}

          {view !== "sources" && (
            <>
              <section className="metrics-grid" aria-label="Network metrics">
                <MetricCard
                  title="Squeek block height"
                  value={integer(core?.core.blockHeight)}
                  caption={
                    core ? "Settled on Ethereum" : reasonText(data?.core.reason)
                  }
                  icon={Box}
                  loading={loading}
                  accent
                />
                <MetricCard
                  title={`Blocks settled · ${range}`}
                  value={integer(settlements?.summary.completedBlockCount)}
                  caption={
                    settlements
                      ? `${integer(settlements.summary.settlementCount)} settlements in period`
                      : reasonText(data?.settlements.reason)
                  }
                  icon={Zap}
                  loading={loading}
                />
                <MetricCard
                  title="Lifetime wheel work"
                  value={integer(stats?.lifetime.acceptedWorkUnits)}
                  caption={
                    stats
                      ? `${token(stats.lifetime.observedDistanceMm, 6, 2)} km observed distance`
                      : reasonText(data?.stats.reason)
                  }
                  icon={Activity}
                  loading={loading}
                />
                <MetricCard
                  title="SQK live supply"
                  value={compactToken(
                    economy?.supply.liveSupplyBaseUnits,
                    economy?.asset.decimals,
                  )}
                  unit="SQK"
                  detail={
                    economy
                      ? token(
                          economy.supply.liveSupplyBaseUnits,
                          economy.asset.decimals,
                          18,
                        ) + " SQK"
                      : undefined
                  }
                  caption={
                    mintPercent == null
                      ? reasonText(data?.economy.reason)
                      : `${mintPercent.toFixed(2)}% of supply cap`
                  }
                  icon={Coins}
                  loading={loading}
                />
              </section>

              <div className="visual-grid">
                <section
                  className="panel activity-panel"
                  aria-labelledby="chart-heading"
                >
                  <div className="panel-heading">
                    <div>
                      <div className="section-kicker">THE BIG PICTURE</div>
                      <h2 id="chart-heading">
                        {chartTitle}
                        <span
                          className="info-icon"
                          title="Values are reported by the official API. Charts do not interpolate missing observations."
                        >
                          <CircleHelp size={14} />
                        </span>
                      </h2>
                    </div>
                    <div className="range-control" aria-label="Chart period">
                      {(["24h", "7d", "30d"] as Range[])
                        .filter((r) => !wheel || r !== "24h")
                        .map((r) => (
                          <button
                            key={r}
                            onClick={() => setRange(r)}
                            aria-pressed={range === r}
                            className={range === r ? "selected" : ""}
                          >
                            {r.toUpperCase()}
                          </button>
                        ))}
                    </div>
                  </div>
                  <div className="chart-toolbar">
                    {wheel ? (
                      <div className="chart-summary">
                        <span className="legend-dot" />
                        Accepted wheel work
                        <span className="chart-unit">
                          work units / device day
                        </span>
                      </div>
                    ) : (
                      <div className="chart-tabs" aria-label="Chart metric">
                        {(
                          [
                            { id: "blocks", title: "Block rate" },
                            { id: "work", title: "Wheel work" },
                            { id: "sqk", title: "SQK issued" },
                          ] as { id: Metric; title: string }[]
                        ).map((m) => (
                          <button
                            key={m.id}
                            onClick={() => {
                              if (view === "sqk") navigate("overview");
                              setMetric(m.id);
                            }}
                            className={
                              effectiveMetric === m.id ? "selected" : ""
                            }
                            aria-pressed={effectiveMetric === m.id}
                          >
                            {effectiveMetric === m.id && (
                              <span className="legend-dot" />
                            )}
                            {m.title}
                          </button>
                        ))}
                      </div>
                    )}
                    <span className="chart-unit desktop-unit">{unit}</span>
                  </div>
                  {loading && !data ? (
                    <div className="chart-canvas chart-loading">
                      <RefreshCw className="spin" size={22} />
                      <span>Reading the chain…</span>
                    </div>
                  ) : points.some((p) => p.value !== null) ? (
                    table ? (
                      <div className="chart-data-table">
                        <table>
                          <caption className="sr-only">Chart values</caption>
                          <thead>
                            <tr>
                              <th>Period (UTC)</th>
                              <th>{unit}</th>
                              <th>Coverage</th>
                            </tr>
                          </thead>
                          <tbody>
                            {points.map((p, i) => (
                              <tr key={i}>
                                <td>{p.fullLabel}</td>
                                <td>
                                  {p.value == null
                                    ? "Unavailable"
                                    : p.value.toLocaleString("en-US", {
                                        maximumFractionDigits: 3,
                                      })}
                                </td>
                                <td>{p.coverage ?? "Settlement buckets"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <AnalyticsChart
                        points={points}
                        unit={unit}
                        bar={wheel || effectiveMetric === "sqk"}
                      />
                    )
                  ) : (
                    <Empty>
                      {reasonText(
                        wheel ? data?.stats.reason : data?.settlements.reason,
                      ) || "No observations available"}
                    </Empty>
                  )}
                  <div className="chart-footer">
                    <span>
                      <span className="legend-dot" />
                      {wheel
                        ? "Missing observations are gaps; device days begin at 12:00 UTC."
                        : "Rate = settled blocks / elapsed bucket hours. All times UTC."}
                    </span>
                    <div>
                      <button
                        onClick={() => setTable((v) => !v)}
                        disabled={!points.length}
                      >
                        {table ? "Chart view" : "Table view"}
                      </button>
                      <button
                        className="export-button"
                        onClick={exportCsv}
                        disabled={!points.length}
                        title="Download chart as CSV"
                        aria-label="Download chart data"
                      >
                        <ArrowDownToLine size={14} />
                      </button>
                    </div>
                  </div>
                </section>

                <section
                  className="panel hamster-panel"
                  aria-labelledby="hamster-heading"
                >
                  <div className="hamster-top">
                    <span className="section-kicker">MEET THE MINER</span>
                    <Pill tone={online && !fault ? "green" : "amber"}>
                      {measurement
                        ? online
                          ? fault
                            ? "Sensor fault"
                            : "Sensor online"
                          : "Sensor stale"
                        : "No telemetry"}
                    </Pill>
                  </div>
                  <div className="hamster-name">
                    <h2 id="hamster-heading">Squeektoshi</h2>
                    <p>Chief Wheel Officer</p>
                  </div>
                  <HamsterWheel running={running} />
                  <div
                    className={`hamster-state ${running ? "is-active" : ""}`}
                  >
                    <span className="status-dot" />
                    {measurement
                      ? online
                        ? fault
                          ? "Counter needs attention"
                          : running
                            ? "Doing the little legwork"
                            : "Taking a well-earned breather"
                        : "Waiting for fresh telemetry"
                      : "Waiting for the first reading"}
                  </div>
                  <div className="hamster-stats">
                    <div>
                      <span>Wheel speed</span>
                      <strong>
                        {online && !fault
                          ? (measurement.rpmMilli / 1000).toFixed(1)
                          : "—"}
                        <small>RPM</small>
                      </strong>
                    </div>
                    <div>
                      <span>Running speed</span>
                      <strong>
                        {online && !fault
                          ? (measurement.speedMmPerSecond / 1000).toFixed(2)
                          : "—"}
                        <small>m/s</small>
                      </strong>
                    </div>
                  </div>
                  <div className="hamster-source">
                    <Fingerprint size={12} />
                    {measurement
                      ? `${measurement.provenance} telemetry · illustration above`
                      : "Illustration · live telemetry unavailable"}
                  </div>
                </section>
              </div>

              {view === "wheel" && <WheelDetails stats={stats} data={data} />}
              {(view === "overview" || view === "blocks") && (
                <section
                  className="panel blocks-panel"
                  aria-labelledby="blocks-heading"
                >
                  <div className="panel-heading">
                    <div>
                      <div className="section-kicker">ONCHAIN ACTIVITY</div>
                      <h2 id="blocks-heading">
                        Latest Squeek blocks
                        <span className="count-label">
                          {settlements?.recentSettlements.length ?? "—"} batches
                        </span>
                      </h2>
                    </div>
                    <button
                      className="subtle-button"
                      onClick={() => setExpanded((v) => !v)}
                    >
                      {expanded ? "Show less" : "View all batches"}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                  <p className="table-explainer">
                    Completed Squeek blocks grouped by settlement. Time shown is
                    Ethereum settlement time.
                  </p>
                  <div className="table-scroll">
                    <table className="blocks-table">
                      <thead>
                        <tr>
                          <th>SQUEEK BLOCKS</th>
                          <th>SETTLED AT (UTC)</th>
                          <th>WORK ADDED</th>
                          <th>BLOCKS</th>
                          <th>TRANSACTION</th>
                          <th>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {settlements?.recentSettlements
                          .slice(0, expanded ? 10 : 5)
                          .map((s) => (
                            <tr key={`${s.transactionHash}-${s.logIndex}`}>
                              <td>
                                <span className="block-cube">
                                  <Box size={16} />
                                </span>
                                <strong>
                                  #{integer(s.firstCompletedBlock)}
                                  {s.firstCompletedBlock !==
                                    s.lastCompletedBlock && (
                                    <span className="block-range">
                                      –{integer(s.lastCompletedBlock)}
                                    </span>
                                  )}
                                </strong>
                              </td>
                              <td>
                                {dateTime(s.blockTimestamp).replace(" UTC", "")}
                              </td>
                              <td>{integer(s.workAdded)}</td>
                              <td>{integer(s.completedBlockCount)}</td>
                              <td>
                                <SourceLink
                                  url={`https://eth-sepolia.blockscout.com/tx/${s.transactionHash}`}
                                >
                                  {shortHash(s.transactionHash)}
                                </SourceLink>
                              </td>
                              <td>
                                <span className="settled-label">
                                  <Check size={12} />
                                  {s.confirmationStatus === "safe"
                                    ? "Safe"
                                    : s.confirmationStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {!settlements && (
                      <Empty>
                        {loading
                          ? "Loading settlements…"
                          : reasonText(data?.settlements.reason)}
                      </Empty>
                    )}
                    {settlements && !settlements.recentSettlements.length && (
                      <Empty>
                        No block-completing settlements in this period. Try a
                        longer range.
                      </Empty>
                    )}
                  </div>
                  <div className="table-bottom">
                    <span>
                      API-reported · {settlements?.chain.confirmations ?? "—"}{" "}
                      Ethereum confirmations
                    </span>
                    <span>Exact block production times: unavailable</span>
                  </div>
                </section>
              )}

              {(view === "overview" || view === "sqk") && (
                <div className="bottom-grid">
                  <section className="panel economy-panel">
                    <div className="panel-heading">
                      <div>
                        <div className="section-kicker">
                          LITTLE WORK, SHARED REWARDS
                        </div>
                        <h2>The SQK economy</h2>
                      </div>
                      <span className="token-symbol">
                        <Coins size={20} />
                      </span>
                    </div>
                    <div className="supply-heading">
                      <span>Live supply</span>
                      <strong
                        title={
                          economy
                            ? token(
                                economy.supply.liveSupplyBaseUnits,
                                economy.asset.decimals,
                                18,
                              )
                            : undefined
                        }
                      >
                        {compactToken(
                          economy?.supply.liveSupplyBaseUnits,
                          economy?.asset.decimals,
                        )}
                        <small>
                          {" "}
                          /{" "}
                          {compactToken(
                            economy?.supply.capBaseUnits,
                            economy?.asset.decimals,
                          )}{" "}
                          SQK
                        </small>
                      </strong>
                    </div>
                    <div className="supply-track">
                      <span style={{ width: `${mintPercent ?? 0}%` }} />
                    </div>
                    <div className="supply-labels">
                      <span>
                        {mintPercent == null
                          ? "Unavailable"
                          : `${mintPercent.toFixed(2)}% issued`}
                      </span>
                      <span>Lifetime cap</span>
                    </div>
                    <div className="economy-facts">
                      <div>
                        <span>Staked SQK</span>
                        <strong>
                          {economy?.staking
                            ? token(
                                economy.staking.totalStakedBaseUnits,
                                economy.asset.decimals,
                              )
                            : "—"}
                        </strong>
                      </div>
                      <div>
                        <span>Live Squeeks</span>
                        <strong>{integer(economy?.nft.live)}</strong>
                      </div>
                      <div>
                        <span>Market price</span>
                        <span className="unavailable-text">
                          Not available
                          <CircleHelp size={12} />
                        </span>
                      </div>
                    </div>
                    <div className="panel-bottom">
                      <span>Testnet token · no price feed</span>
                      <SourceLink url="https://docs.squeekchain.com/developers/api/#economy-state">
                        Source
                      </SourceLink>
                    </div>
                  </section>
                  <section className="panel network-panel">
                    <div className="panel-heading">
                      <div>
                        <div className="section-kicker">UNDER THE HOOD</div>
                        <h2>Network pulse</h2>
                      </div>
                      <Network size={19} className="muted" />
                    </div>
                    <div className="pulse-row">
                      <span>
                        <ShieldCheck size={16} />
                        SqueekCore
                      </span>
                      <Pill
                        tone={
                          core
                            ? core.core.paused
                              ? "amber"
                              : "green"
                            : "neutral"
                        }
                      >
                        {core
                          ? core.core.paused
                            ? "Paused"
                            : "Unpaused"
                          : "Unavailable"}
                      </Pill>
                    </div>
                    <div className="pulse-row">
                      <span>
                        <Gauge size={16} />
                        Difficulty
                      </span>
                      <strong title="Work units required for 1,000 Squeek blocks">
                        {integer(core?.core.workPerThousandBlocks)}
                        <small>work / 1K blocks</small>
                      </strong>
                    </div>
                    <div className="pulse-row">
                      <span>
                        <Timer size={16} />
                        Settlement round
                      </span>
                      <strong>
                        #{integer(core?.core.settledThroughRound)}
                        <small>
                          {core
                            ? `${integer(core.configuration.roundDuration)}s rounds`
                            : "Unavailable"}
                        </small>
                      </strong>
                    </div>
                    <div className="pulse-row">
                      <span>
                        <Box size={16} />
                        Next block progress
                      </span>
                      <strong>
                        {core
                          ? `${percent(core.core.blockProgress, core.configuration.blockUnitsPerBlock).toFixed(1)}%`
                          : "—"}
                        <small>settled frontier</small>
                      </strong>
                    </div>
                    <div className="panel-bottom">
                      <span>
                        {projected
                          ? `${integer(projected.completedBlockCount)} projected blocks · optimistic`
                          : "Projection unavailable"}
                      </span>
                      <button onClick={() => navigate("sources")}>
                        Sources
                        <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </section>
                </div>
              )}
              {view === "blocks" && (
                <div className="notice">
                  <CircleHelp size={16} />
                  <span>
                    Squeek blocks measure physical work. They are distinct from
                    Ethereum blocks; no transaction TPS, gas or validator counts
                    are inferred.
                  </span>
                </div>
              )}
            </>
          )}
          {view === "sources" && <Sources data={data} loading={loading} />}
          <footer className="page-footer">
            <div>
              <Logo small />
              <span>
                Built for the little guy.
                <Heart size={12} />
              </span>
            </div>
            <div>
              <span className={`footer-dot ${error ? "error" : ""}`} />
              <span aria-live="off">
                {data
                  ? `Last checked ${checked! < 60 ? `${checked}s` : `${Math.floor(checked! / 60)}m`} ago${!auto ? " · paused" : ""}`
                  : loading
                    ? "Connecting to official sources"
                    : "Sources unavailable"}
              </span>
              <span className="footer-divider">·</span>
              <button onClick={() => navigate("sources")}>
                Data transparency
                <ArrowUpRight size={12} />
              </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

function WheelDetails({
  stats,
  data,
}: {
  stats: Stats | null;
  data: Analytics | null;
}) {
  return (
    <section className="panel wheel-details">
      <div className="panel-heading">
        <div>
          <div className="section-kicker">THE OBSERVATION WINDOW</div>
          <h2>Activity & coverage</h2>
        </div>
        <Activity size={19} />
      </div>
      <div className="wheel-facts">
        <div>
          <span>Observed rounds</span>
          <strong>{integer(stats?.rounds.observedCount)}</strong>
        </div>
        <div>
          <span>Active rounds</span>
          <strong>{integer(stats?.rounds.activeCount)}</strong>
        </div>
        <div>
          <span>Missing rounds</span>
          <strong>{integer(stats?.rounds.missingCount)}</strong>
        </div>
        <div>
          <span>Coverage</span>
          <strong>
            {stats
              ? `${(stats.activity.coverage.coverageBps / 100).toFixed(1)}%`
              : "—"}
          </strong>
        </div>
        <div>
          <span>Peak observed RPM</span>
          <strong>
            {stats?.records.peakObservedRpmMilli
              ? (
                  Number(stats.records.peakObservedRpmMilli.value) / 1000
                ).toFixed(1)
              : "—"}
          </strong>
        </div>
      </div>
      <div className="panel-bottom">
        <span>
          Coverage is availability of observations; it does not measure uptime
          or hamster health.
        </span>
        <SourceLink
          url={
            data?.stats.url ??
            "https://docs.squeekchain.com/developers/api/#measurement-stats"
          }
        >
          Source
        </SourceLink>
      </div>
    </section>
  );
}

function Sources({
  data,
  loading,
}: {
  data: Analytics | null;
  loading: boolean;
}) {
  const resources: {
    key: "pipeline" | "core" | "economy" | "settlements" | "stats";
    title: string;
    purpose: string;
    cadence: string;
    version: number;
  }[] = [
    {
      key: "pipeline",
      title: "WHEELY9000 telemetry",
      purpose:
        "Measured RPM, speed, freshness, provenance and optimistic block projection.",
      cadence: "5s server cache",
      version: 1,
    },
    {
      key: "core",
      title: "SqueekCore",
      purpose: "Settled block height, work, difficulty and round frontier.",
      cadence: "15s server cache",
      version: 1,
    },
    {
      key: "settlements",
      title: "Settlement history",
      purpose:
        "Block batches and per-period settled blocks, work and SQK issuance.",
      cadence: "60s server cache",
      version: 3,
    },
    {
      key: "economy",
      title: "SQK economy",
      purpose: "Live supply, cap, issuance, staking and Squeek counts.",
      cadence: "15s server cache",
      version: 2,
    },
    {
      key: "stats",
      title: "Measurement statistics",
      purpose: "Accepted activity, historical distance, coverage and records.",
      cadence: "5m server cache",
      version: 1,
    },
  ];
  return (
    <div className="sources-stack">
      <section className="panel sources-intro">
        <ShieldCheck size={25} />
        <div>
          <h2>Real sources. Clear boundaries.</h2>
          <p>
            Every response is checked against the official JSON Schema.
            Unavailable values stay unknown. SQK amounts use exact integer
            arithmetic. These are API-reported observations; this application
            does not independently verify Ethereum RPC state.
          </p>
        </div>
      </section>
      {resources.map((r) => {
        const source = data?.[r.key] as SourceResult<unknown> | undefined;
        const generatedAt = (source?.data as { generatedAt?: string } | null)
          ?.generatedAt;
        return (
          <section key={r.key} className="panel source-card">
            <div className="source-card-top">
              <h2>{r.title}</h2>
              <Pill tone={source?.state === "available" ? "green" : "amber"}>
                {source ? source.state : loading ? "Checking" : "Unavailable"}
              </Pill>
            </div>
            <p>{r.purpose}</p>
            {source && <SourceLink url={source.url}>{source.url}</SourceLink>}
            <div className="source-meta">
              <span>Schema v{r.version}</span>
              <span>{r.cadence}</span>
              <span>
                {source
                  ? `Checked ${dateTime(source.checkedAt)}`
                  : "Not checked yet"}
              </span>
              {generatedAt && <span>Generated {dateTime(generatedAt)}</span>}
              {source?.sourceMode && <span>Snapshot: {source.sourceMode}</span>}
            </div>
            {source?.reason && (
              <div className="source-error">
                {reasonText(source.reason)}
                {source.retryAfter != null &&
                  ` · retry after ${source.retryAfter}s`}
                {source.upstream?.requestId &&
                  ` · request ${source.upstream.requestId}`}
                {source.upstream?.edgeRay &&
                  ` · edge ${source.upstream.edgeRay}`}
                {source.upstream?.ownerActionRequired &&
                  " · source provider action required"}
              </div>
            )}
          </section>
        );
      })}
      <section className="panel source-card deployment-card">
        <div className="source-card-top">
          <h2>Deployment identity</h2>
          <Pill tone={data?.deployment.mismatch ? "amber" : "neutral"}>
            {data?.deployment.mismatch == null
              ? "Unknown"
              : data.deployment.mismatch
                ? "Record mismatch"
                : "Record matches"}
          </Pill>
        </div>
        <p>
          The deployment record snapshot was retrieved from the official
          documentation on {data?.deployment.checkedAt ?? "2026-10-29"}.{" "}
          {data?.deployment.mismatch == null
            ? "The current deployment comparison is unavailable."
            : data.deployment.mismatch
              ? "The API reports a different deployment."
              : "The API addresses match the saved record."}{" "}
          Values remain explicitly API-reported; contract identities have not
          been independently verified through RPC.
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Contract</th>
                <th>Published record</th>
                <th>Current API</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>SqueekCore</td>
                <td>
                  <code>{data?.deployment.documentedCore ?? "—"}</code>
                </td>
                <td>
                  <code>{data?.deployment.apiCore ?? "Unavailable"}</code>
                </td>
              </tr>
              <tr>
                <td>SQK token</td>
                <td>
                  <code>{data?.deployment.documentedToken ?? "—"}</code>
                </td>
                <td>
                  <code>{data?.deployment.apiToken ?? "Unavailable"}</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Core/economy API chain and Core address consistency:{" "}
          <strong>
            {data?.deployment.consistent == null
              ? "Unknown"
              : data.deployment.consistent
                ? "Match on Sepolia"
                : "Mismatch"}
          </strong>
          . This is an internal consistency check, not an onchain verification.
        </p>
        <SourceLink url="https://docs.squeekchain.com/assets/deployments/sepolia.json">
          Official deployment record
        </SourceLink>
      </section>
      <section className="panel source-card">
        <h2>What is deliberately unavailable</h2>
        <p>
          Market price, market cap, trading volume, TPS, validator count and
          exact individual block production times have no verified source in
          this integration. No sample numbers, invented RPC endpoints or
          synthetic activity are displayed. Device activity is a sensor reading,
          not a medical or behavioral assessment of the hamster.
        </p>
        <p>
          Official developer examples use viem 2 with a user-supplied Sepolia
          RPC. No dedicated Squeekchain RPC or runtime SDK is required for the
          documented read-only API.
        </p>
        <SourceLink url="https://docs.squeekchain.com/developers/quickstart/">
          Official contract quickstart
        </SourceLink>
      </section>
    </div>
  );
}
