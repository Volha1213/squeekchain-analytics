import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import {
  integer,
  token,
  compactToken,
  chartNumber,
  percent,
} from "../src/lib/format";
import { validateSource, type SourceKey } from "../src/lib/validate";

for (const key of [
  "pipeline",
  "core",
  "economy",
  "settlements",
  "stats",
] as SourceKey[]) {
  const fixture = JSON.parse(
    readFileSync(new URL(`./fixtures/${key}.json`, import.meta.url), "utf8"),
  );
  test(`${key}: accepts captured real API data, rejects schema version drift`, () => {
    assert.equal(validateSource(key, fixture), true);
    assert.equal(
      validateSource(key, { ...fixture, schemaVersion: 999 }),
      false,
    );
    assert.equal(
      validateSource(key, {
        ...fixture,
        futureAdditiveField: "safe to ignore",
      }),
      true,
    );
  });
}
test("SQK retains exact 18-decimal precision beyond IEEE-754", () => {
  assert.equal(
    token("11914771138841588939432012", 18, 18),
    "11,914,771.138841588939432012",
  );
  assert.equal(token("1", 18, 18), "0.000000000000000001");
  assert.equal(compactToken("2100000000000000000000000000"), "2.10B");
  assert.equal(integer("18446744073709551615"), "18,446,744,073,709,551,615");
});
test("unavailable values remain unknown, real zero stays zero", () => {
  assert.equal(token(undefined), "—");
  assert.equal(integer(undefined), "—");
  assert.equal(integer("0"), "0");
  assert.equal(chartNumber(null), null);
  assert.equal(chartNumber("0"), 0);
  assert.equal(chartNumber("18446744073709551615"), null);
  assert.equal(percent("1", "1000000000"), 0);
});
test("token chart conversion truncates at an explicit presentation boundary", () => {
  assert.equal(chartNumber("11914771138841588939432012", 18), 11914771.138841);
});
