import type { Analytics } from "./types";
import { chartNumber, dateTime } from "./format";

export type ChartPoint = {
  label: string;
  value: number | null;
  fullLabel: string;
  coverage?: string;
};
export type Metric = "blocks" | "work" | "sqk";

export function buildPoints(
  data: Analytics | null,
  metric: Metric,
  wheel: boolean,
): ChartPoint[] {
  if (wheel) {
    return (
      data?.stats.data?.activity.days.map((d) => ({
        label: new Date(d.date + "T12:00:00Z").toLocaleDateString("en-GB", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }),
        fullLabel: `${d.date} · noon-to-noon UTC`,
        value:
          d.coverage.observedRoundCount === 0
            ? null
            : chartNumber(d.observedWorkUnits),
        coverage: `${(d.coverage.coverageBps / 100).toFixed(1)}%`,
      })) ?? []
    );
  }
  const source = data?.settlements.data;
  if (!source || source.status !== "available") return [];
  const now = Math.min(Date.now(), Date.parse(source.generatedAt));
  return source.buckets.map((b) => {
    const start = Date.parse(b.startAt),
      end = Date.parse(b.endAt);
    // A window includes future buckets. They are unknown, not observed zeroes.
    const elapsedHours = Math.max(0, (Math.min(end, now) - start) / 3_600_000);
    const count = chartNumber(b.completedBlockCount);
    const value =
      start > now
        ? null
        : metric === "blocks"
          ? elapsedHours > 0 && count != null
            ? count / elapsedHours
            : null
          : metric === "work"
            ? chartNumber(b.workAdded)
            : source.mining.status === "available"
              ? chartNumber(
                  b.sqkMintedBaseUnits,
                  source.mining.economy.decimals,
                )
              : null;
    return {
      label: new Date(b.startAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        ...(data?.range === "24h" ? { hour: "2-digit" } : {}),
        timeZone: "UTC",
      }),
      fullLabel: dateTime(b.startAt),
      value,
    };
  });
}
