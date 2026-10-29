import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { buildPoints } from "../src/lib/chart-data";
import type { Analytics, Stats, Settlements } from "../src/lib/types";

const stats = JSON.parse(
  readFileSync(new URL("./fixtures/stats.json", import.meta.url), "utf8"),
) as Stats;
const settlements = JSON.parse(
  readFileSync(new URL("./fixtures/settlements.json", import.meta.url), "utf8"),
) as Settlements;
const data = {
  range: "7d",
  stats: { data: stats },
  settlements: { data: settlements },
} as Analytics;

test("missing historical wheel coverage creates a gap; a covered idle day is zero", () => {
  const points = buildPoints(data, "work", true);
  assert.equal(points[0].value, null);
  assert.equal(
    points.find((p) => p.fullLabel.startsWith("2026-10-29"))?.value,
    0,
  );
  assert.equal(points[3].coverage, "92.4%");
});
test("settled block rate uses elapsed bucket hours and future buckets remain unknown", () => {
  if (settlements.status !== "available")
    throw new Error("Expected recorded real settlements");
  const points = buildPoints(data, "blocks", false);
  const activeIndex = settlements.buckets.findIndex(
    (b) => BigInt(b.completedBlockCount) > 0n,
  );
  assert.ok(activeIndex >= 0);
  assert.equal(
    points[activeIndex].value,
    Number(settlements.buckets[activeIndex].completedBlockCount) / 6,
  );
  assert.equal(points.at(-1)?.value, null);
});
test("SQK chart remains unknown when mining data is unavailable", () => {
  if (settlements.status !== "available")
    throw new Error("Expected recorded real settlements");
  const unavailable = {
    ...data,
    settlements: {
      ...data.settlements,
      data: {
        ...settlements,
        mining: { status: "unavailable", reason: "not_yet_safe" },
      },
    },
  } as Analytics;
  assert.ok(
    buildPoints(unavailable, "sqk", false).every((p) => p.value === null),
  );
});
