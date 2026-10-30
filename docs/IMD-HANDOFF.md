# Update the existing IMD site

Prepared for job [d370b7e7-35b0-445d-8766-e690d0ad13a9](https://explorer.imd.fun/jobs/d370b7e7-35b0-445d-8766-e690d0ad13a9). Its public API currently reports that job as the completed project head, with no version running. This may change; read it again before ordering.

## Keep the same project

The documented action is **`job.continue`**, using the newest `project.head` as `parentJobId`, paid by the original project owner. `ipfs: true` updates the existing site's next version under its existing name. It creates a new version/job record; it does not rewrite a completed job or mutate an old CID. See [official continuation documentation](https://imd.fun/docs/).

Do not use `job.open`, a new launch or Genesis “Create project” for this repair. Keep the existing Squeekchain Genesis project if one is already registered. No Genesis or badge status was changed here.

## Make the prepared files available first

The static source is available on the public [ipfs-imd-static branch](https://github.com/Volha1213/squeekchain-analytics/tree/ipfs-imd-static) of the existing repository. Downloadable offline ZIPs are also available in the maintainer's local `release/` folder; they are not public hosting URLs. An IMD worker cannot read a BB filesystem link.

Resolve the public static branch's exact 40-character commit and use its commit URL to replace `SOURCE_REFERENCE` in `handoff/continuation.template.json`. Do not submit the placeholder or use production `main` as the static source. Official `inputs` require metadata from accepted IMD artifacts; do not invent hashes or submission IDs for a local ZIP.

The static branch includes `vercel.json` with automatic deployment disabled specifically for `ipfs-imd-static`. Never merge this conversion into production `main`.

## Request the continuation

1. Confirm the original wallet and latest project head with public `GET https://api.imd.fun/jobs/d370b7e7-35b0-445d-8766-e690d0ad13a9`.
2. Use the template's explicit `build-website` skill, rather than repeating the old `import-site` task that only allowed `dist/**` changes. The objective authorizes the necessary static source/config changes.
3. Keep `github: false` to prevent source delivery into the production repository. Do not add `repoUrl`, `baseCommit`, `projectId` or launch fields to a continuation; the project supplies its starting point.
4. Run the official free request check, review the scope and quote, then authorize any payment yourself. No request, signature or payment was performed by this preparation.
5. Require review of the full static output, including the real game, before hosting. After IMD publishes, verify its returned **new CID** through `/ipfs/NEW_CID/` and the existing site name. The old CID must continue to describe its old bytes.

## Acceptance for the IMD worker/reviewer

- `npm ci`, `npm test` and `npm run build` succeed; resulting `dist/` has `index.html`, local relative CSS/JS chunks and icon.
- No Next server runtime, root-absolute asset URLs, runtime schema compilation, `eval` or `unsafe-eval` requirement.
- Game: start, timing controls, points, combo, one hit per lap, 30-second finish, pause/resume, reset, keyboard and touch. Points are explicitly fictional and separate from real SQK/network data.
- All six views open at a nested gateway prefix; real API data is validated, and offline/malformed data stays unknown without crashing. Blocked storage does not prevent loading.
- Visible independent-community disclaimer, mobile layout, both themes and reduced-motion behavior.
- Do not change the Vercel site, production `main`, wallet state, Genesis entry or unrelated projects. Do not deploy contracts or issue a token.

The existing IMD site has not yet been updated by this work. Local gateway-style QA is not a new public IPFS publication. Buildooooor eligibility and any award remain unconfirmed.
