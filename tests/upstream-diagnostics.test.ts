import assert from "node:assert/strict";
import { test } from "node:test";
import { upstreamDiagnostics } from "../src/lib/upstream-diagnostics";
import { readSource } from "../src/lib/sources";

test("provider denial is traceable without exposing its body or cookies", async () => {
  const response = Response.json({
    error_code: 1010,
    owner_action_required: true,
    retryable: false,
    detail: "private diagnostic contents",
  }, { status: 403, headers: {
    "x-request-id": "source-request-123", "cf-ray": "abc123-IAD",
    "set-cookie": "private-cookie-value",
  } });
  const result = await upstreamDiagnostics(response);
  assert.equal(result.errorCode, 1010);
  assert.equal(result.ownerActionRequired, true);
  assert.equal(result.requestId, "source-request-123");
  assert.equal(result.edgeRay, "abc123-IAD");
  assert.doesNotMatch(JSON.stringify(result), /private|detail|cookie/i);
});

test("HTML challenges and oversized JSON are not echoed or interpreted", async () => {
  const html = new Response("<html>private challenge contents</html>", {
    status: 403, headers: { "content-type": "text/html", "cf-mitigated": "challenge" },
  });
  const a = await upstreamDiagnostics(html);
  assert.equal(a.mitigation, "challenge");
  assert.equal(a.errorCode, null);
  assert.doesNotMatch(JSON.stringify(a), /private/);
  const b = await upstreamDiagnostics(Response.json({
    error_code: 1010, padding: "x".repeat(17000),
  }, { status: 403 }));
  assert.equal(b.errorCode, null);
});

test("explicit non-retryable denial stops polling and remains unknown", async () => {
  const previous = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return Response.json({ error_code: 1010, retryable: false,
      owner_action_required: true }, { status: 403 });
  };
  try {
    const a = await readSource("stats", "/measurement/stats?range=30d", 0);
    const b = await readSource("stats", "/measurement/stats?range=30d", 0);
    assert.equal(calls, 1);
    assert.equal(a.state, "error");
    assert.equal(a.data, null);
    assert.match(a.reason!, /403.*1010/);
    assert.deepEqual(a, b);
  } finally {
    globalThis.fetch = previous;
  }
});

test("a protection challenge is reported and never automatically retried", async () => {
  const previous = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return new Response("<html>challenge</html>", { status: 403, headers: {
      "content-type": "text/html; charset=UTF-8", "cf-mitigated": "challenge",
      "cf-ray": "test-ray-IAD",
    } });
  };
  try {
    const a = await readSource("core", "/core", 0);
    const b = await readSource("core", "/core", 0);
    assert.equal(calls, 1);
    assert.equal(a.data, null);
    assert.match(a.reason!, /protection challenge/);
    assert.equal(a.upstream?.mitigation, "challenge");
    assert.deepEqual(a, b);
  } finally {
    globalThis.fetch = previous;
  }
});
