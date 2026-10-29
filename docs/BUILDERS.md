# Builder eligibility and submission research

Checked on 2026-10-29. This document separates publicly available badge rules from submission code shipped by the official website but not exposed as a working public submission route during this check.

## Confirmed public badge rules

Source: [Squeekchain Aura](https://squeekchain.com/genesis/aura).

- Buildooooor requires a project submission with verified attribution.
- Early Buildooooor is limited to the first 88 members to verify a project. Availability cannot be inferred from a local build date or a cached badge count.
- Aura ranking requires a verified wallet and a linked X account.
- A published repository, a working website, or this document does not establish that a badge has been awarded.

## Public submission availability

During this check, [Genesis](https://squeekchain.com/genesis) explicitly marked the Code section as not open yet. Visiting `https://squeekchain.com/genesis/code` opened a profile error instead of a submission page. The production route table in the official website bundle did not register the Code project routes. Use the submission action on Genesis if and when it is enabled.

Do not present `/genesis/code` as a working submission form without checking it again. This repository contains no submitted project ID or issued challenge.

## Rules found in official, currently inactive submission code

Research sources: [official Code page bundle](https://squeekchain.com/assets/code-page-OVAH2nO8.js), [official project page bundle](https://squeekchain.com/assets/code-project-DZ_MR5_1.js). Asset hashes may change when the official site is updated.

The bundled direct submission flow describes control of a site's exact hostname through a DNS TXT challenge and a source-code link. It excludes shared hosts such as `vercel.app` and `github.io`. Its project page describes GitHub-only attribution as retired, and its FAQ describes daily DNS rechecks. These are observations of the published implementation, not confirmation that the flow is currently open or that these rules will remain unchanged.

If this flow opens unchanged, deploy on Vercel, attach an owned domain or subdomain, and retain the exact TXT record issued by the portal. A stable `vercel.app` deployment is useful for public QA but would not satisfy that described DNS requirement. Do not purchase a domain or change DNS solely on the assumption that an inactive flow is final.

## Eligibility limitation of this project

The same bundled guidance excludes dashboards, explorers, trackers and thin API wrappers that only read data. **Squeekchain Analytics currently is a read-only analytics application.** Its schema validation, data transparency, charts and exports do not justify claiming it passes that guidance.

Ask the Squeekchain team whether this analytics application is accepted under the current rules before treating deployment as badge eligibility. If that guidance becomes the active policy, a substantial product feature beyond analytics may be necessary. Do not hide the application's read-only nature or rename it to imply a different product.

## Publication and evidence checklist

1. Publish the reviewed source to a separate public GitHub repository under the maintainer's account.
2. Deploy the exact `main` commit to Vercel production and verify the HTTPS URL anonymously, without a BB session or Vercel deployment protection.
3. Record the real repository URL, deployment URL, Git commit, build/test results, source checks and product screenshots.
4. Use [AUTHORSHIP.md](AUTHORSHIP.md) to track control evidence. A self-written statement is not independent verification.
5. Check the live Genesis portal and currently active eligibility/attribution rules. The owner must perform any wallet or X connection.
6. If required by the active portal, use an owned hostname and publish its actual DNS TXT challenge. Copy the portal's exact name and value; never invent a record or put private challenge material in this repository.
7. Submit the honest English description in [SUBMISSION.md](SUBMISSION.md), after replacing only fields backed by real publication evidence.
8. Treat status as not submitted, not verified and not awarded until the portal or team supplies the corresponding confirmation.

This application does not use IMD. Its code and publication cannot be attributed to an IMD paid job.
