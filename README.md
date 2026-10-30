# Squeekchain Analytics — static IPFS edition

An **independent community project**, not affiliated with or endorsed by Squeekchain. Real analytics and a clearly separate, just-for-fun hamster rhythm game.

Public static source: [ipfs-imd-static](https://github.com/Volha1213/squeekchain-analytics/tree/ipfs-imd-static). This edition is maintained in the isolated `squeekchain-analytics-ipfs` worktree. The Next.js application on `main` and its Vercel production site are unchanged. Do not merge this static branch into `main`.

## What was repaired

The existing [IMD job](https://explorer.imd.fun/jobs/d370b7e7-35b0-445d-8766-e690d0ad13a9) copied a Next.js server build into a static folder. Its root-absolute `/_next/` paths fail under a path gateway. The IMD domain also forbids `unsafe-eval`; AJV's runtime `Function(...)` schema compiler caused the actual `EvalError` behind the “little wheel jam” screen.

This version uses React + TypeScript + Vite, with `base: "./"`, bundled local assets, hash navigation and **build-time standalone schema validators**. It needs no Next.js server, API route, database, wallet, external font or environment secret. CSP permits scripts from the site itself and public API reads, without `unsafe-eval`. Browser storage is not used, so blocked storage cannot crash the theme or game. Static security policy is in the HTML; server-only Next.js security headers are not claimed.

## Run and build

Use Node.js 24.x and npm:

```bash
npm ci
npm test
npm run build
npm run preview
```

`npm run build` generates validators, checks TypeScript, creates `dist/`, then checks asset paths and forbidden server/eval dependencies. `npm run preview` serves the actual output on port 4173 without SPA rewrites. Test these paths (the CID here is a **local routing fixture**, not a newly published CID):

```text
http://localhost:4173/
http://localhost:4173/ipfs/bafybeic5ti5om22inn4cwndj5xerywdhexcyygoxrauqcpkzxjd4okq27e/
http://localhost:4173/gateway/v2/ipfs/bafybeic5ti5om22inn4cwndj5xerywdhexcyygoxrauqcpkzxjd4okq27e/#game
http://localhost:4173/ipns/community.example/index.html#sources
```

A path gateway must serve a directory URL with a trailing slash, or redirect to it. Hash views do not need server routing. Serve over HTTP(S); double-clicking a `file://` HTML file is not the supported module-loading environment.

## Wheel Arcade

Open **Wheel arcade** in the sidebar or **Play the mini-game** on Overview. Start a 30-second round. Tap **Spin!**, press **Space** or **→** as the moving dot reaches the green arc. The bright center awards a perfect hit; consecutive hits build a bonus. A miss or skipped lap breaks the combo. Only one attempt per lap counts.

Pause/resume and reset are explicit controls. Leaving the tab pauses the game. The final score and best combo are shown when the clock ends. The best score is local to the mounted game view and is lost when that view/page is reopened. Touch targets, narrow layouts and reduced-motion preferences are supported.

**All game points are fictional.** They are not SQK, physical hamster activity, mining, blockchain blocks, rewards, NFTs or a claim on anything. There are no wallet calls, transactions, token approvals or paid actions in this app. Game state is separate from the API reader and never changes analytics.

## Real data and unavailable states

The analytics views read only five documented public GET endpoints at `https://api.squeekchain.com/v1`: status, core, economy/state, settlements and measurement/stats. Credentials are omitted. Official schemas, integer bounds, timestamp formats, additive fields, ETags, request coalescing, backoff and exact SQK amounts are preserved. Validation happens in the browser with precompiled functions, not dynamic schema compilation.

When a source is unavailable, blocked, malformed or unreachable, the affected values remain unknown. There are no runtime demo fixtures or invented blockchain metrics. Recorded test fixtures are used only by tests and are not shipped as a data fallback. The game works independently of API availability after its assets load. Users' ordinary API requests reach Squeekchain from their own networks.

The published deployment record and current API still differ, including Mining v6 versus v9. The source screen keeps the Core/SQK discrepancy visible. This application does not verify the graph independently through RPC or prepare owner transactions. Any reward assistant described in historical documents is a proposal, not part of this release.

There is **no `/api/analytics` endpoint in this static edition**. Earlier Vercel incident and badge documents describe the original application and are not evidence of a static server route or badge award.

## Delivery

Publish the **contents** of `dist/`, with `index.html` at the IPFS directory root. Do not publish `.next/`, dependencies, a repository root, a ZIP file as the website, or only `index.html` without its sibling assets.

For offline delivery archives (Python 3 required):

```bash
npm run pack:ipfs
```

`release/` contains the website ZIP, reproducible-source ZIP, SHA-256 checksums and a per-file build manifest. Packaging makes no network request and performs no upload or publication. `dist/` is ready to hand to an authorized IMD build/review step.

See [IMD-HANDOFF.md](docs/IMD-HANDOFF.md) and [the continuation template](handoff/continuation.template.json). The static source branch is public; IPFS hosting has not been updated. No paid continuation, IPFS pin or Genesis project creation is run automatically. The branch's Vercel configuration disables automatic deployment for `ipfs-imd-static`.
