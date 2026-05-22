# Release Readiness

Generated 2026-05-22 from a full local audit on Windows 11 + Node 22.

## 1. Current Head

- Commit: `1641bd9` refactor: require GenLayer trial engine
- Branch: `master`
- Working tree: clean at the time of deployment verification

Recent commits on this branch:

```text
1641bd9 refactor: require GenLayer trial engine
db5f848 docs(release): note Studionet seed completion in readiness report
bbe3fda docs(contract): record Studionet seed receipts
```

## 2. Repo And Deploy Status

- Local `master` is in sync with `origin/master` after pushing `1641bd9`.
- Vercel Git auto-deploy still appears unreliable. The production alias was
  refreshed with an explicit CLI deploy.
- Production URL: `https://consentvault.vercel.app`
- Production deploy id: `dpl_FZPCDLxwLSMbG3hVuWup42oA3sLh`
- Deployment URL: `https://consentvault-n6cz89my1-ngh1105s-projects.vercel.app`
- Created: 2026-05-22 22:01 ICT

## 3. Automated Verification

| Command | Result | Notes |
| --- | --- | --- |
| `npm run lint` | pass | eslint, no findings |
| `npx tsc --noEmit` | pass | clean after `next build` regenerated `.next/types` |
| `npm run build` | pass | Next.js 15, 6 routes generated, OG edge route built |
| `npm test` | pass | Vitest, 21 files, 86 tests |
| `npx playwright test` | pass | 22 passed, 7 skipped screenshot specs gated by `DEMO_CAPTURE=1` |
| `py -3 -m pytest` | pass | Contract aggregation tests, 27 passed |
| `npm run demo:capture` | pass | Captures the GenLayer-only product path; headless trial screenshot shows the wallet guard |
| `npm run smoke:contract -- 0x1a0f5fBF06fE00627176C0Fe26e64a7a008c9501` | pass | Contract reachable; smoke case returns empty as expected |

## 4. Live Smoke Checks

All checked after the production CLI deploy:

| URL | Result |
| --- | --- |
| `/` | 200 HTML |
| `/policy` | 200 HTML |
| `/cases/new` | 200 HTML |
| `/cases/case-voice-clone/trial` | 200 HTML; shows `Connect wallet to run the GenLayer trial` without MetaMask |
| `/cases/case-voice-clone/receipt` | 200 HTML |
| `/opengraph-image` | 200 PNG |

Homepage HTML includes `Review creator policies` and `Connect wallet`.
Open Graph metadata includes `ConsentVault - AI consent verdict archive`.

## 5. Human-Only QA

These still require MetaMask, a funded Studionet account, and Vercel project
owner access:

- [ ] Confirm Project Settings -> Git is wired so future `master` pushes deploy
      automatically.
- [ ] Confirm production env vars:
  - `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0x1a0f5fBF06fE00627176C0Fe26e64a7a008c9501`
  - `NEXT_PUBLIC_SITE_URL=https://consentvault.vercel.app`
- [ ] Connect MetaMask to Studionet, chain id `61999`.
- [ ] Run a `run_trial` transaction from `/cases/case-voice-clone/trial`.
- [ ] Confirm the receipt metadata includes the connected GenLayer issuer.
- [ ] Confirm exported receipt JSON includes the `wallet` block.
- [ ] Confirm the OG preview renders in a social preview tool.

## 6. Known Non-Blockers

- No GitHub Actions workflows are configured; CI signal is local verification.
- Vercel Git auto-deploy lag remains an operational concern. Production is
  current because of the explicit CLI deploy above.
- Studionet state is ephemeral. If the public deploy starts showing empty
  receipts for previously seeded cases, redeploy the contract and update
  `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS`.

## 7. Final Verdict

**READY FOR FINAL HUMAN METAMASK QA.**

The codebase is GenLayer-only, production is serving the latest pushed
application surface, automated checks pass, live route smoke checks pass, and
the deployed contract is reachable. The remaining work is the signer-bound
MetaMask transaction walkthrough.
