import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { readSource } from "../src/lib/sources";
const fixture = (name: string) =>
  JSON.parse(
    readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), "utf8"),
  );

test("HTTP 200 unavailable is never converted into zero or an empty dataset", async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = async () =>
    Response.json({
      schemaVersion: 1,
      installationId: "stream-game-sepolia-test-20261025-01",
      status: "unavailable",
      reason: "indexer_unavailable",
    });
  try {
    const r = await readSource("core", "/core", 1000);
    assert.equal(r.state, "unavailable");
    assert.equal(r.data, null);
    assert.equal(r.reason, "indexer_unavailable");
  } finally {
    globalThis.fetch = previous;
  }
});
test("malformed source data is isolated as an error", async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = async () =>
    Response.json({
      schemaVersion: 2,
      status: "available",
      supply: { liveSupplyBaseUnits: 0 },
    });
  try {
    const r = await readSource("economy", "/economy/state", 1000);
    assert.equal(r.state, "error");
    assert.equal(r.data, null);
    assert.match(r.reason!, /schema/);
  } finally {
    globalThis.fetch = previous;
  }
});
test("upstream 429 Retry-After prevents early retries", async () => {
  const previous = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return new Response(null, {
      status: 429,
      headers: { "Retry-After": "90" },
    });
  };
  try {
    const a = await readSource("settlements", "/settlements?range=30d", 1000);
    const b = await readSource("settlements", "/settlements?range=30d", 1000);
    assert.equal(calls, 1);
    assert.equal(a.retryAfter, 90);
    assert.equal(b.data, null);
  } finally {
    globalThis.fetch = previous;
  }
});
test("ETag revalidation retains data on 304 without fabricating a new generation time", async () => {
  const previous = globalThis.fetch;
  const data = fixture("stats");
  let calls = 0;
  globalThis.fetch = async (_input, init) => {
    calls++;
    if (calls === 1)
      return Response.json(data, { headers: { ETag: '"real-snapshot-test"' } });
    assert.equal(
      new Headers(init?.headers).get("If-None-Match"),
      '"real-snapshot-test"',
    );
    return new Response(null, { status: 304 });
  };
  try {
    const a = await readSource<{ generatedAt: string }>(
      "stats",
      "/measurement/stats?range=7d",
      -1,
    );
    const b = await readSource<{ generatedAt: string }>(
      "stats",
      "/measurement/stats?range=7d",
      -1,
    );
    assert.equal(calls, 2);
    assert.equal(b.state, "available");
    assert.equal(b.data?.generatedAt, a.data?.generatedAt);
  } finally {
    globalThis.fetch = previous;
  }
});
test("simultaneous callers share one upstream request", async () => {
  const previous = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return Response.json(fixture("pipeline"));
  };
  try {
    const results = await Promise.all([
      readSource("pipeline", "/status", 5000),
      readSource("pipeline", "/status", 5000),
    ]);
    assert.equal(calls, 1);
    assert.equal(results[0].state, "available");
    assert.equal(results[1].state, "available");
  } finally {
    globalThis.fetch = previous;
  }
});
