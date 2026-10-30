import { useCallback, useEffect, useRef, useState } from "react";
import type { Analytics, Range } from "@/lib/types";
import { getAnalytics } from "@/lib/sources";

export function useAnalytics(range: Range, auto: boolean) {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inflight = useRef(false),
    current = useRef(range),
    lastRequest = useRef(0),
    previousRange = useRef(range);
  current.current = range;
  const refresh = useCallback(async () => {
    if (inflight.current || Date.now() - lastRequest.current < 2000) return;
    inflight.current = true;
    lastRequest.current = Date.now();
    setLoading(true);
    const requestedRange = current.current;
    try {
      // The public API explicitly supports credential-free browser CORS reads.
      // Use that documented transport directly, without a challenged server
      // proxy, hidden fallback, client impersonation or challenge handling.
      const result = await getAnalytics(requestedRange);
      if (requestedRange === current.current) {
        setData(result);
        setError(null);
      }
    } catch {
      if (requestedRange === current.current)
        setError(
          "Unable to refresh. Displayed values are from the last successful request.",
        );
    } finally {
      inflight.current = false;
      setLoading(false);
      if (requestedRange !== current.current) {
        lastRequest.current = 0;
        window.setTimeout(() => void refresh(), 0);
      }
    }
  }, []);
  useEffect(() => {
    if (previousRange.current !== range) {
      setData(null);
      setError(null);
      previousRange.current = range;
    }
    lastRequest.current = 0;
    void refresh();
  }, [range, refresh]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (auto && document.visibilityState === "visible") void refresh();
    }, 15_000);
    const visible = () => {
      if (auto && document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [auto, refresh]);
  return { data, loading, error, refresh };
}
