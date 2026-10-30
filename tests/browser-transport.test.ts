import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { getAnalytics } from "../src/lib/sources";

test("direct browser transport uses only credential-free official URLs and validates each source", async () => {
  const previous = globalThis.fetch;
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { value: {}, configurable: true });
  const fixtures: Record<string, string> = {
    "/v1/status": "pipeline", "/v1/core": "core",
    "/v1/economy/state": "economy", "/v1/settlements": "settlements",
    "/v1/measurement/stats": "stats",
  };
  const urls: string[] = [];
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input));
    assert.equal(url.origin, "https://api.squeekchain.com");
    assert.equal(init?.credentials, "omit");
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("Authorization"), null);
    assert.equal(headers.get("Cookie"), null);
    assert.equal(headers.get("User-Agent"), null);
    assert.ok(fixtures[url.pathname]);
    urls.push(url.href);
    // A failed source must not prevent the four valid sources from loading.
    if (url.pathname === "/v1/core")
      return Response.json({ status: "available", schemaVersion: 999 });
    return Response.json(JSON.parse(readFileSync(
      new URL(`./fixtures/${fixtures[url.pathname]}.json`, import.meta.url), "utf8",
    )));
  };
  try {
    const result = await getAnalytics("7d");
    assert.equal(urls.length, 5);
    assert.equal(result.transport, "browser-direct");
    assert.equal(result.core.state, "error");
    assert.equal(result.core.data, null);
    for (const key of ["pipeline", "economy", "settlements", "stats"] as const)
      assert.equal(result[key].state, "available");
    assert.equal(result.economy.data?.status, "available");
    assert.equal(result.deployment.mismatch, null);
  } finally {
    globalThis.fetch = previous;
    if (windowDescriptor) Object.defineProperty(globalThis, "window", windowDescriptor);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
