# Static IPFS edition

This branch is a standalone React + Vite site. Do not restore Next.js server routes or absolute-root asset paths. Build with `npm run build`; publish only the contents of `dist/`. Keep `base: "./"`, build-time standalone schema validators and a CSP without `unsafe-eval`. The hamster game uses fictional local points only; never feed game state into API statistics or label it SQK.

Test root and nested `/ipfs/CID/` paths in a real browser, including API failures, restrictive CSP, denied storage, touch and keyboard input. Never update `main`, the Vercel production project, Genesis or the paid IMD job automatically.
