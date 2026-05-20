# Release Readiness

Generated 2026-05-20 from a full local audit on Windows 11 + Node 22.

## 1. Current head

- Commit: `29b96c3` docs: refresh demo screenshots
- Branch: `master`
- Working tree: clean

Recent commits on this branch:

```
29b96c3 docs: refresh demo screenshots
64b2605 docs: align receipt JSON copy with Export disclosure UI
bd51001 chore(e2e): align consentvault-flow with redesigned UI
c405d71 chore(e2e): refresh a11y keyboard assertions
b4d4185 chore(tests): fix typecheck regressions
5adce53 chore(a11y): polish keyboard interactions
```

## 2. Repo sync status

- Local `master` is **ahead of `origin/master` by 1 commit** (`29b96c3`).
- Push is required before kicking off the next Vercel deploy.

## 3. Automated verification

| Command | Result | Notes |
| --- | --- | --- |
| `npm run lint` | pass | eslint, no findings |
| `npm test` | pass | Vitest, 22 files, 98 tests |
| `npx tsc --noEmit` | pass | clean (no output) |
| `npm run build` | pass | Next.js 15, 6 routes generated, OG edge route built |
| `npx playwright test` | pass | 22 passed, 14 skipped (demo specs gated by `DEMO_CAPTURE=1`) |
| `npx playwright test tests/e2e/meta.spec.ts` | pass | 2/2 (`og:*` meta + `/opengraph-image` PNG) |
| `npm run demo:capture` | pass with override | Required `NEXT_PUBLIC_TRIAL_ENGINE=mock` shell override so the trial route renders the workspace instead of the `TrialGuard` empty state in the headless browser. `.env.local` was not modified. 4 screenshots updated: `02-policy.png`, `03-new-case.png`, `06-trial.png`, `07-receipt.png`. |

## 4. Human-only checklist

These cannot be exercised from CI/CLI without a funded Studionet account,
MetaMask interaction, or Vercel project owner login. Run them after pushing
`29b96c3` to origin.

- [ ] **Vercel Git auto-deploy connected** — pushing to `master` triggers a
      production deploy on Vercel.
- [ ] **Production env vars set** in Vercel project settings:
  - `NEXT_PUBLIC_TRIAL_ENGINE=genlayer`
  - `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0x…`
  - `NEXT_PUBLIC_SITE_URL=https://<deploy>.vercel.app`
- [ ] **MetaMask connects to Studionet (chain id `61999`)** — header shows
      truncated address + `Genlayer Studio Network`.
- [ ] **`run_trial` write transaction** — open `/cases/case-voice-clone/trial`,
      MetaMask prompts for a write tx, approve and wait for `FINALIZED`.
- [ ] **Receipt route shows GenLayer issuer** — verdict banner renders, the
      metadata grid includes the issuer address row.
- [ ] **Export receipt as JSON includes wallet block** — expand the
      `<details>` disclosure on the receipt route; JSON contains a `wallet`
      object with `issuerAddress`, `chainId: 61999`, `networkName`, and
      `issuedVia: "genlayer-js"`.
- [ ] **OG preview** — paste the public URL into LinkedIn, X, or
      https://www.opengraph.xyz/. The 1200×630 archive-style PNG renders
      with `Studionet · Chain id 61999` in the footer.

## 5. Known non-blockers

- **No GitHub Actions workflows configured** — `gh run list --limit 5`
  returns empty. CI signal is local verification only.
- **0 open pull requests, 0 open issues** at audit time.
- **Demo screenshots refreshed** — committed at `29b96c3`. They reflect the
  modern redesign and the mock-engine trial workspace.
- **Trial screenshot capture requires a mock-engine override** — when
  `.env.local` is set to `genlayer`, the headless browser cannot satisfy
  the wallet guard, so screenshot regeneration must inject
  `NEXT_PUBLIC_TRIAL_ENGINE=mock` for the run. This is a property of the
  capture script, not a runtime bug.
- **Studionet ephemerality** — Studio resets wipe contract state. If the
  public deploy starts showing empty receipts, redeploy the contract per
  `docs/deploy-contract.md` and update `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS`.

## 6. Final verdict

**READY FOR HUMAN QA.**

All automated checks pass on the current head. Outstanding work is
inherently wallet/dashboard-bound and cannot be exercised from CLI. Push
`29b96c3` to `origin/master`, then walk the human checklist above.
