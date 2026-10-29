# Official API schemas

Retrieved 2026-10-29 from `https://docs.squeekchain.com/assets/api/`:

- `status.json`
- `core.json`
- `economy-state.json`
- `measurement-stats.json`
- `settlements.json`

These are unmodified upstream JSON snapshots. `../validate.ts` allows unknown additive properties at compilation time, following the official API versioning policy, while preserving schema versions, required fields, ranges, and formats. It registers the documented unsigned decimal formats and standard date/date-time/UUID formats.

Review the official changelog/documentation before updating snapshots or adding support for new breaking versions. Never update an expected version just to suppress validation errors.
