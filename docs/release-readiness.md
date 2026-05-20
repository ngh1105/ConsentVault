# Release Readiness

Generated 2026-05-20 from a full local audit on Windows 11 + Node 22.

## 1. Current head

- Commit: `be7a80c` docs: add release readiness report
- Branch: `master`
- Working tree: clean

Recent commits on this branch:

```
be7a80c docs: add release readiness report
29b96c3 docs: refresh demo screenshots
64b2605 docs: align receipt JSON copy with Export disclosure UI
bd51001 chore(e2e): align consentvault-flow with redesigned UI
c405d71 chore(e2e): refresh a11y keyboard assertions
b4d4185 chore(tests): fix typecheck regressions
5adce53 chore(a11y): polish keyboard interactions
```

## 2. Repo sync status

- Local `master` is **in sync with `origin/master`** (push completed
  2026-05-20 ~11:26 UTC).
- Next signal comes from Vercel; see §5 for the auto-deploy concern.

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
MetaMask interaction, or Vercel project owner login. Production
(`https://consentvault.vercel.app`) is now serving the latest commit
(deploy id `dpl_6aBbtSTZ198aLTAwYqbqxPvFVt2A`, created
2026-05-20 19:30 ICT) — start from the wallet flow.

- [ ] **Vercel Git auto-deploy connected** — the CLI deploy worked, but
      the previous push did not auto-trigger a build. Confirm Project
      Settings → Git is wired so future `master` pushes deploy without
      manual intervention.
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

## 5. Known non-blockers and observed concerns

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
- **Vercel auto-deploy lag (observed concern, partially resolved)** — at
  audit time, the most recent production deployment on
  `consentvault.vercel.app` was 19 hours old despite a fresh push to
  `origin/master`. Pushing the next commit (`26c22a0`) also did not
  trigger a build within the observation window. The fresh production
  surface was restored by an explicit CLI deploy
  (`npx vercel --prod`, deploy id `dpl_6aBbtSTZ198aLTAwYqbqxPvFVt2A`,
  alias `https://consentvault.vercel.app`). The underlying Git-integration
  question is still unverified — confirm via Project Settings → Git in
  the Vercel dashboard before relying on push-to-deploy for further
  iterations.
- **Studionet ephemerality** — Studio resets wipe contract state. If the
  public deploy starts showing empty receipts, redeploy the contract per
  `docs/deploy-contract.md` and update `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS`.

## 6. Final verdict

**READY FOR HUMAN METAMASK QA.**

All automated checks pass on the current head. Production
(`https://consentvault.vercel.app`) is now serving deploy
`dpl_6aBbtSTZ198aLTAwYqbqxPvFVt2A` (created via CLI deploy at
2026-05-20 19:30 ICT) and homepage HTML carries the redesigned copy
(`Review creator policies`, `Create case`, `Read the policy`).
Outstanding work is wallet/dashboard-bound; walk
`docs/manual-qa-checklist.md` against the live URL.
