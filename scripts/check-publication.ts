import { parseArgs } from "node:util";
import { validateSource, type SourceKey } from "../src/lib/validate";

const { values } = parseArgs({
  options: { site: { type: "string" }, repository: { type: "string" } },
  strict: true,
});

async function read(url: string) {
  return fetch(url, {
    signal: AbortSignal.timeout(30_000),
    headers: { Accept: "application/json, text/html;q=0.9" },
    cache: "no-store",
  });
}

async function main() {
  if (!values.site || !values.repository)
    throw new Error(
      "Supply --site https://PUBLIC_HOST --repository OWNER/NAME",
    );
  const site = new URL(values.site);
  const host = site.hostname.toLowerCase().replace(/\.$/, "");
  if (
    site.protocol !== "https:" ||
    site.username ||
    site.password ||
    site.search ||
    site.hash ||
    site.pathname !== "/" ||
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".getbb.app") ||
    host === "getbb.app" ||
    host === "[::1]" ||
    /^\d+\.\d+\.\d+\.\d+$/.test(host)
  )
    throw new Error(
      "Use a permanent public HTTPS origin, without credentials or BB sharing",
    );
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(values.repository))
    throw new Error("Repository must be OWNER/NAME");

  const root = await read(site.origin);
  if (root.status !== 200 || new URL(root.url).origin !== site.origin)
    throw new Error(
      `Anonymous site request failed or redirected outside the site: HTTP ${root.status}`,
    );
  const html = await root.text();
  if (!html.includes("Squeekchain Analytics") || !html.includes("Small paws."))
    throw new Error("Anonymous response is not the Squeekchain dashboard");
  console.log(
    "PASS: anonymous HTTPS dashboard, with no cookies or authorization",
  );

  const response = await read(`${site.origin}/api/analytics?range=7d`);
  if (response.status !== 200 || new URL(response.url).origin !== site.origin)
    throw new Error(
      `Anonymous analytics request failed: HTTP ${response.status}`,
    );
  const analytics = await response.json();
  let available = 0;
  for (const key of [
    "pipeline",
    "core",
    "economy",
    "settlements",
    "stats",
  ] as SourceKey[]) {
    const source = analytics[key];
    if (
      !source ||
      !["available", "unavailable", "error"].includes(source.state)
    )
      throw new Error(`${key}: invalid source envelope`);
    if (source.state === "available") {
      if (!validateSource(key, source.data))
        throw new Error(`${key}: invalid official schema`);
      available++;
    } else if (
      source.data !== null ||
      typeof source.reason !== "string" ||
      !source.reason
    )
      throw new Error(
        `${key}: unavailable source must have null data and a reason`,
      );
    console.log(
      `${key}: ${source.state}${source.reason ? ` (${source.reason})` : ""}`,
    );
  }
  if (available === 0)
    throw new Error("No live data sources available; verify data later");

  const checks = [
    ["/api/analytics?range=invalid", 400],
    ["/api/analytics?range=7d&range=30d", 400],
    ["/this-page-does-not-exist", 404],
    ["/.env", 404],
    ["/.git/config", 404],
    ["/icon.svg", 200],
  ] as const;
  for (const [path, expected] of checks) {
    const result = await read(site.origin + path);
    if (result.status !== expected)
      throw new Error(`${path}: HTTP ${result.status}, expected ${expected}`);
    console.log(`PASS: ${path} → ${expected}`);
  }

  const repo = await read(`https://api.github.com/repos/${values.repository}`);
  if (repo.status !== 200)
    throw new Error(`Public GitHub repository: HTTP ${repo.status}`);
  const metadata = await repo.json();
  if (metadata.private !== false || metadata.default_branch !== "main")
    throw new Error(
      "Repository must be public with main as its default branch",
    );
  const main = await read(
    `https://api.github.com/repos/${values.repository}/commits/main`,
  );
  if (main.status !== 200)
    throw new Error(`Public main commit: HTTP ${main.status}`);
  console.log(
    `PASS: public repository ${metadata.html_url}, main ${(await main.json()).sha}`,
  );
  console.log(
    "Browser QA is still required for all five hash views, charts, themes and mobile layout.",
  );
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Publication verification failed",
  );
  process.exitCode = 1;
});
