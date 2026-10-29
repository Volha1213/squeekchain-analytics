# Public source review

Reviewed 2026-10-29 before publication. This application does not need account credentials, wallet keys, an API key or a paid RPC endpoint. Deployment credentials belong in the hosting/account connection, outside this repository.

The complete local Git history was scanned with Gitleaks 8.30.1 using its standard rules and redacted reports. Three initial generic-token findings were reviewed: they were exact public contract addresses in the recorded API regression fixtures. Each was matched against the unauthenticated official API. `.gitleaks.toml` permits only those exact addresses, only in the two relevant fixture files. It does not broadly exclude test data or token-named fields.

The reviewed history scan found no remaining leaks. This is a recorded scan result, not a guarantee about future commits. Run the history scan again before publishing changes:

```bash
gitleaks git . --redact=100 --log-opts=--all
npm audit --omit=dev
```

`.gitignore` excludes environment files, Vercel state, dependencies, logs and build output. `.env.example` contains comments only. API fixtures contain publicly readable testnet responses and are never used as production fallback data. Public Ethereum addresses, transaction hashes and published sensor signatures are not private wallet keys.

The maintainer account is identified by its public GitHub login. Private account email, access tokens, cookies, OAuth codes, local task logs and authentication links are not part of this source tree. Publication requires a separate reviewed commit; repeat the scan if its contents or history change.
