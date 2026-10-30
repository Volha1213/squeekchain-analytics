import type {
  Analytics,
  Range,
  SourceResult,
  Pipeline,
  Core,
  Economy,
  Settlements,
  Stats,
  UpstreamDiagnostics,
} from "./types";
import { validateSource, type SourceKey } from "./validate";
import { upstreamDiagnostics } from "./upstream-diagnostics";
import deployment from "./deployment-record.json";

const API = "https://api.squeekchain.com/v1";
type Entry = {
  expires: number;
  result: SourceResult<unknown>;
  etag: string | null;
};
const cache = new Map<string, Entry>();
const pending = new Map<string, Promise<SourceResult<unknown>>>();

export async function readSource<T>(
  key: SourceKey,
  path: string,
  ttl: number,
): Promise<SourceResult<T>> {
  const url = API + path,
    cached = cache.get(url);
  if (cached && cached.expires > Date.now())
    return cached.result as SourceResult<T>;
  if (pending.has(url)) return pending.get(url)! as Promise<SourceResult<T>>;
  const request = (async (): Promise<SourceResult<unknown>> => {
    const checkedAt = new Date().toISOString();
    let retryAfter: number | null = null;
    let upstream: UpstreamDiagnostics | undefined;
    try {
      const response = await fetch(url, {
        cache: "no-store",
        credentials: "omit",
        signal: AbortSignal.timeout(8000),
        headers: {
          Accept: "application/json",
          ...(cached?.etag && cached.result.data
            ? { "If-None-Match": cached.etag }
            : {}),
        },
      });
      if (response.status === 304 && cached?.result.data) {
        const result = { ...cached.result, checkedAt };
        cache.set(url, { ...cached, result, expires: Date.now() + ttl });
        return result;
      }
      const retry = response.headers.get("Retry-After");
      if (retry)
        retryAfter = /^\d+$/.test(retry)
          ? Math.min(86400, Number(retry))
          : Math.max(0, Math.ceil((Date.parse(retry) - Date.now()) / 1000));
      upstream = await upstreamDiagnostics(response);
      if (!response.ok) {
        if (typeof window === "undefined") console.warn(JSON.stringify({
          event: "squeekchain_upstream_error", source: key, url, checkedAt,
          ...upstream,
        }));
        throw new Error(`HTTP ${response.status}${upstream.mitigation === "challenge"
          ? " (source protection challenge; provider action required)" : ""}${upstream.errorCode != null
          ? ` (provider code ${upstream.errorCode})` : ""}`);
      }
      const data: unknown = await response.json();
      if (!validateSource(key, data))
        throw new Error("Unsupported schema or invalid response");
      const unavailable =
        (data as { status?: string }).status === "unavailable";
      const result: SourceResult<unknown> = {
        state: unavailable ? "unavailable" : "available",
        data: unavailable ? null : data,
        reason: unavailable ? (data as { reason: string }).reason : null,
        checkedAt,
        url,
        sourceMode: response.headers.get("X-Squeek-Settlement-Source"),
        retryAfter,
        upstream,
      };
      cache.set(url, {
        result,
        expires: Date.now() + Math.max(ttl, (retryAfter ?? 0) * 1000),
        etag: response.headers.get("ETag"),
      });
      return result;
    } catch (error) {
      const result: SourceResult<unknown> = {
        state: "error",
        data: null,
        reason:
          error instanceof Error && error.name === "TimeoutError"
            ? "Source timed out"
            : error instanceof Error
              ? error.message
              : "Source request failed",
        checkedAt,
        url,
        sourceMode: null,
        retryAfter,
        ...(upstream ? { upstream } : {}),
      };
      cache.set(url, {
        result,
        // A provider's explicit non-retryable denial must not be polled.
        // A new deployment resets this per-instance cache after owner action.
        expires: upstream?.retryable === false || upstream?.mitigation === "challenge"
          ? Infinity
          : Date.now() + Math.max(
              upstream?.status === 403 ? 300_000 : 15_000,
              (retryAfter ?? 0) * 1000,
            ),
        etag: null,
      });
      return result;
    } finally {
      pending.delete(url);
    }
  })();
  pending.set(url, request);
  return request as Promise<SourceResult<T>>;
}

export async function getAnalytics(range: Range): Promise<Analytics> {
  const [pipeline, core, economy, settlements, stats] = await Promise.all([
    readSource<Pipeline>("pipeline", "/status", 5_000),
    readSource<Core>("core", "/core", 15_000),
    readSource<Economy>("economy", "/economy/state", 15_000),
    readSource<Settlements>(
      "settlements",
      `/settlements?range=${range}`,
      60_000,
    ),
    readSource<Stats>(
      "stats",
      `/measurement/stats?range=${range === "30d" ? "30d" : "7d"}`,
      300_000,
    ),
  ]);
  const c = core.data?.status === "available" ? core.data : null;
  const e = economy.data?.status === "available" ? economy.data : null;
  const documentedCore = deployment.record.contracts.SqueekCore.address;
  const documentedToken = deployment.record.contracts.SqueekToken.address;
  const mismatch =
    c && e
      ? c.identities.core.toLowerCase() !== documentedCore.toLowerCase() ||
        e.identities.token.toLowerCase() !== documentedToken.toLowerCase()
      : null;
  const consistent =
    c && e
      ? c.chain.chainId === "11155111" &&
        e.chain.chainId === "11155111" &&
        c.identities.core.toLowerCase() === e.identities.core.toLowerCase()
      : null;
  return {
    fetchedAt: new Date().toISOString(),
    range,
    transport: typeof window === "undefined" ? "server" : "browser-direct",
    pipeline,
    core,
    economy,
    settlements,
    stats,
    deployment: {
      source: deployment.source,
      checkedAt: deployment.checkedAt,
      documentedCore,
      documentedToken,
      mismatch,
      consistent,
      apiCore: c?.identities.core ?? null,
      apiToken: e?.identities.token ?? null,
    },
  };
}
