import { getAnalytics } from "../src/lib/sources";
import {
  validationIssue,
  validateSource,
  type SourceKey,
} from "../src/lib/validate";

const result = await getAnalytics("7d");
let failures = 0;
for (const key of [
  "pipeline",
  "core",
  "economy",
  "settlements",
  "stats",
] as SourceKey[]) {
  const source = result[key];
  console.log(
    `${key}: ${source.state}${source.reason ? ` (${source.reason})` : ""} — ${source.url}`,
  );
  if (source.state !== "available") failures++;
  if (source.data && !validateSource(key, source.data)) {
    console.error(validationIssue(key));
    failures++;
  }
}
console.log(
  `Deployment record differs from API: ${result.deployment.mismatch}; core/economy internally consistent on Sepolia: ${result.deployment.consistent}`,
);
console.log("Data is API-reported; no independent RPC verification.");
process.exitCode = failures ? 1 : 0;
