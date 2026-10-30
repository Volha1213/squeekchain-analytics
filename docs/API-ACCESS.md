> Historical Vercel incident report for the original application on `main`. This static IPFS edition has no `/api/analytics` route and no Vercel runtime logs. It uses direct public browser reads; see the root README for current static behavior.

# Public API access: production incident and supported transport

Investigated on 2026-10-30 against the public Vercel site and the documented Squeekchain API. Dashboard presentation is unchanged.

## Confirmed cause

The aggregate route returns HTTP 200 because it reports each source independently. All five Vercel-origin requests initially produced an upstream HTTP 403. The diagnostic deployment (`c9e26de2edfe2def37485a7b1965186c198f30fc`) exposed only reviewed provider metadata, not raw error bodies.

At 2026-10-30T00:40:23Z every source returned `content-type: text/html; charset=UTF-8` and `cf-mitigated: challenge`, without the API's `X-Request-Id`. Cloudflare documents this combination as a [Challenge Page](https://developers.cloudflare.com/cloudflare-challenges/challenge-types/challenge-pages/detect-response/). This establishes an edge protection challenge before a usable API response; it is not a JSON schema failure, CORS error on the server, or the API's documented HTTP 429 rate-limit response. The exact security rule, IP/ASN/bot classification and owner configuration have not been observed and must not be guessed.

| Source | Cloudflare Ray ID from Vercel |
| --- | --- |
| `/v1/status` | `a5265e3befffc6d1-IAD` |
| `/v1/core` | `a5265e3bdd3c0cf8-IAD` |
| `/v1/economy/state` | `a5265e3bedc3fe99-IAD` |
| `/v1/settlements?range=7d` | `a5265e3beca073eb-IAD` |
| `/v1/measurement/stats?range=7d` | `a5265e3be990f3a3-IAD` |

Direct reads from the development host were available and validated against all five official schemas. This does not prove availability from Vercel or from every user's network. A separate Python request to the documentation host encountered error 1010; that is not the diagnosed Vercel API challenge and was not used to justify changing User-Agent headers.

## Deployment discrepancy recheck

The API identifies release `stream-game-sepolia-test-20261026-01`, protocol `stream-game-1`, reward model `funded-stream-q128-1`, at deployment block `11998937`. The official record still identifies `squeeks-sepolia-core3-mining6-001` at block `11902282`.

| Identity | Official record | Current API |
| --- | --- | --- |
| Core | `0x74665dAecA35A2303e767E76a2FF1FB6F93e119f` | `0x980b4424c007caf7a1f3670b48c8eaef7ebc3d44` |
| SQK | `0x6872bfa5ccc3e9e440c6c16e5ffdabb8dba4cc76` | `0x5501e1fa81be1c3f49225fa7668da0245d07db60` |
| Mining proxy | `0x3beE588fC20dE788Bac17d33b41Da7346cb27EC4` | `0xcd46990f8349057335289ef282c276204b6cdc62` |
| Mining implementation version | `6` | `9` |

Core and economy API responses agree internally on Sepolia and the Core address, but they do not match that record. This suggests different releases; it does not establish which release is approved for a new application. It is not independent RPC verification. The version-6 owner-action ABI must not be used against the API's version-9 Mining address. Keep the dashboard's discrepancy notice and require a current official record, matching ABI and verified graph before any owner transaction.

## Documented public access used by the dashboard

The [official API reference](https://docs.squeekchain.com/developers/api/) explicitly allows unauthenticated browser reads from any website with `Access-Control-Allow-Origin: *`. An actual preflight from the production site's Origin returned HTTP 204 and allowed `GET,OPTIONS` plus `if-none-match`.

The dashboard therefore uses normal browser `fetch` directly to the fixed official public URLs with credentials omitted. It preserves schema validation, integer precision, ETags, request coalescing, error isolation and the same polling/cache intervals. It does not first try a denied Vercel proxy, impersonate another client, solve a challenge, reuse clearance cookies, rotate IPs/regions or use an alternate hidden API host. This is a documented client integration, not restoration of Vercel server permission. A denied browser request remains unavailable too.

The server aggregate remains available for diagnostics and server clients. It continues to show the actual denial until the provider authorizes server-origin requests. The application does not claim `/api/analytics` has recovered merely because browser data works. Detected challenges and explicitly non-retryable denials stop polling that source for the current reader lifetime. Generic 403 errors back off for five minutes; 429/503 respect `Retry-After`.

Only status, bounded numeric provider code, approved diagnostic headers and boolean owner/retry flags are retained. JSON error parsing is bounded to 16 KiB. HTML and raw error messages, cookies and credentials are never echoed. Server-side `squeekchain_upstream_error` log records contain the same public-safe metadata. Vercel account runtime logs were not available through the connected tools during diagnosis; the evidence above is the actual deployed server reader's sanitized response.

## Provider handoff for server access

The maintainer can send the following to Squeekchain; this repository does not send it automatically:

> Our public Next.js dashboard uses your documented read-only API. Requests from Vercel's Node.js runtime receive HTTP 403 with `cf-mitigated: challenge` and HTML, while direct public reads are available elsewhere. Please inspect the Ray IDs and UTC timestamp above and confirm the approved server-to-server access method. If the challenge is unintended for `/v1` public GETs, please adjust the relevant rule or provide an approved integration policy. We are not requesting credentials, bypassing the challenge or retrying denied clients through alternate IPs. Please also confirm the current Sepolia deployment record: live API identities differ from the published Core and SQK addresses.

After provider confirmation, redeploy to reset per-instance denial caches, recheck all five server sources from production, compare identities, and only then mark server access restored. The existing `npm run check:publication -- --site https://squeekchain-analytics.vercel.app --repository Volha1213/squeekchain-analytics` deliberately fails if the server route has no available sources; browser QA must be recorded separately.
