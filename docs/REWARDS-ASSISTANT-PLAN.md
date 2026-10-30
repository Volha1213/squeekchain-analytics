> Historical, unimplemented proposal. The static IPFS edition ships a local fictional-points game, not this contract rewards assistant. No wallet or transaction feature is enabled.

# SQK Rewards Assistant — implementation proposal

Status: proposed on 2026-10-30. This feature is **not implemented or enabled**. The existing dashboard remains read-only. No claim or checkpoint has been sent by this application.

## User benefit and builder rationale

Help Squeek NFT owners determine which rewards are funded and claimable, understand a transaction before signing it, and collect SQK through the official Sepolia contracts. This would add an owner action to the existing analytics product. A wallet button or simulated demo alone would not establish a substantial contract integration.

The official [owner-action guide](https://docs.squeekchain.com/developers/owner-actions/) describes applications that prepare owner claims, simulate them and hand unsigned calls to the owner's wallet. This is a plausible improvement over a read-only dashboard under the inactive guidance described in [BUILDERS.md](BUILDERS.md), **not confirmation of eligibility**. The team must confirm the active criteria, attribution process and award. Early Buildooooor placement cannot be promised.

## First gate: establish the correct deployment

The live public API and the [official deployment record](https://docs.squeekchain.com/assets/deployments/sepolia.json) currently name different Core and SQK addresses. Do not copy API identities into transaction destinations or call either deployment authoritative without verification. Obtain a current, officially identified record; retain its provenance and reviewed ABI versions.

The mismatch also includes **Mining version 9 in the API versus version 6 in the published record**. The API release is `stream-game-sepolia-test-20261026-01`, while the record is `squeeks-sepolia-core3-mining6-001`. The claim/checkpoint interfaces below describe the documented version-6 owner-action model; they are conditional design references, not verified interfaces for the API's version-9 graph. Obtain the matching current official ABI, record and owner/reward semantics before implementing those calls. Do not decode or simulate the version-9 contract with the version-6 ABI.

Use the [official quickstart verification](https://docs.squeekchain.com/developers/quickstart/) with viem 2 and an approved Sepolia RPC supporting historical reads. No undocumented Squeekchain RPC is assumed. Check chain ID 11155111, EIP-1967 implementation/admin slots, runtime code hashes, layout digests, implementation versions, ProxyAdmin governance, Core configuration and links between Mining, Core, Token and NFT. Read the graph at one confirmed Ethereum block and retain its hash. Recheck the block hash and graph before preparing a wallet action; fail closed on changed identities or unreadable history. A schema-valid API response is not this verification.

## Product flow

1. **Connect voluntarily.** Discover an installed wallet using EIP-6963/EIP-1193; request accounts only on a user click. Ask before switching to Sepolia. Never request a key, seed phrase, token approval, permit or login signature. Disconnect stays available. Wallet addresses and NFT holdings are not persisted on the server or logged.
2. **Choose NFTs.** Accept explicitly entered token IDs first; optional API discovery is convenience, followed by contract reads. Check every selected ID using `ownerOf` and `position(0, id)` at one block. Explain missing/burned NFTs and ownership failures without silently changing the selection. An approved operator is not the owner. A contract wallet must itself own the NFTs and support the chosen submission flow.
3. **Preview rewards.** Read `claimable(0, ids)` as an estimate and simulate `claim(0, ids)` using the connected owner as caller. Use exact `bigint` amounts with 18 decimals. Sort and deduplicate the owner's selection visibly, then split into batches of at most 32. Show the destination contract, network, IDs, simulated SQK payout, zero transaction value, gas estimate, snapshot block/time and possible changes before inclusion. Explain fractional remainder behavior. Avoid zero-payout transactions by default.
4. **Confirm one action.** Invalidate the prepared action when the account, chain, selected IDs, deployment identities or relevant state changes. Immediately before submission, recheck ownership and graph, simulate again, refresh fees and present changed results for review. Only an explicit user click requests wallet confirmation. Send a typed unsigned request to the wallet; the app never signs, automatically retries a write or starts the next batch. User rejection is a normal result.
5. **Verify completion.** Show pending, failed, cancelled/replaced and confirmed states separately. Decode `RewardsClaimed` and SQK `Transfer` only from verified contracts, compare the actual payout and reread positions and balances at the receipt block. Wait for the documented confirmation policy before describing a result as final. A simulation is not a paid reward; a transaction hash is not success.

## Separate optional checkpoint

The [Mining reference](https://docs.squeekchain.com/developers/mining/) distinguishes already-funded claims from processing new settled work. Claims require neither approval nor a checkpoint and remain possible while Core is paused. A checkpoint is permissionless, costs its caller gas, processes rewards globally and does not itself pay the caller.

Show an optional checkpoint step only when `checkpointStatus()` reports unpaused Core and a newly settled round. Read latest state, simulate `checkpoint()`, show cost and scope, and ask for a separate wallet confirmation. After confirmation, reread status and claim estimates. Never loop checkpoint transactions automatically. If another keeper acts first, explain the revert and refresh. Merging, staking, approvals and NFT transfers are outside this first release.

## Interface and architecture

Keep the existing colors, typography, cards, responsive navigation and theme controls. Add a Rewards view with a clear flow: wallet → deployment verified → NFTs → simulation → review → receipt. Analytics remains accessible without connecting. All write controls stay disabled until the deployment gate passes.

Use viem public/wallet clients; keep transaction destinations and reviewed ABI definitions in a dedicated module. Use an explicit, configured RPC; a server-side provider key, if required, must remain in Vercel environment variables and outside public bundles. Prevent arbitrary upstream URLs. Do not use a public analytics error or an API identity as a fallback RPC/contract. Record non-sensitive verification evidence rather than wallet activity in application logs.

## Acceptance and evidence

- Automated contract-client tests: identity/hash/version/chain failures; non-owner/operator; invalid IDs and batch limits; exact amounts; paused Core; stale/reorg snapshots; simulation failure; wallet rejection; changed account/chain; per-batch consent; receipt failure/replacement; correct event origin and actual payout.
- Browser tests with a deterministic wallet/RPC harness: no account request on page load, no transaction before the final click, no automatic second transaction, safe error recovery, mobile and both themes. Harness results are labeled as tests, not public-chain evidence.
- Read-only live Sepolia verification of the reviewed record and a real owner's chosen NFT. An actual claim, if the owner elects to perform one, is signed only in their wallet. Preserve the public transaction/receipt as evidence after permission to associate it with the project; never collect keys.
- Production build, CI, secret scan and anonymous Vercel checks on the exact deployed commit. Verify the current Genesis submission route and criteria again. Update the submission text only to describe shipped, verified behavior.

Prerequisites still unresolved: authoritative current deployment identities, an approved RPC configuration, a connected wallet for owner-performed live validation, and active builder submission criteria. Do not report this proposal as a completed rewards integration.
