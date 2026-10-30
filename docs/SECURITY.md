# Static edition security boundaries

This IPFS edition has no server routes or wallet operations. Its only runtime network origin is the documented public `https://api.squeekchain.com` API. Requests omit credentials. The local game uses no API input and awards no assets or chain activity. Browser storage, service workers, remote scripts/fonts, login forms, analytics trackers and signing are absent.

Official API responses are validated by precompiled functions. The build retains required fields, version checks, standard formats and exact unsigned-integer bounds, while allowing documented additive fields. It does not weaken CSP to allow runtime schema compilation. Malformed or unavailable responses become explicit source errors with null data.

HTML contains a CSP without `unsafe-eval`, a no-referrer policy and a no-script explanation. Inline style attributes are allowed for React/SVG/chart layout. A static HTML document cannot provide server-only X-Frame-Options, nosniff or CSP frame-ancestors headers; any gateway-supplied headers remain that gateway's responsibility. No such headers are claimed as application-server features.

IPFS path gateways can share an origin between unrelated sites. This app intentionally keeps theme and game state in memory, uses no persistent user data and asks for no browser/wallet permission. Prefer an origin-isolated subdomain gateway for public use when available. A new content version has a new CID; no integrity or availability promise is made about an arbitrary third-party gateway.

Historical Vercel incident and contract-reward proposal documents are reference material. The static app does not implement the proposed rewards assistant. Current API/deployment identities differ; no transaction should be prepared with an unverified graph or an ABI for a different implementation version.
