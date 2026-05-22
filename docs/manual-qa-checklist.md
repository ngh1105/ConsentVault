# Manual QA Checklist

The release passes all automated checks. The remaining steps below require a
human with MetaMask, a funded Studionet account, and Vercel project owner
access. Walk this list against the production URL after confirming the
latest commit deployed.

Production URL: `https://consentvault.vercel.app`

## 1. Vercel deploy

- [ ] **Auto-deploy wired to `master`.** Open the Vercel dashboard for the
      `consentvault` project. Project Settings → Git should show the
      `ngh1105/ConsentVault` repository connected with `master` as the
      production branch.
- [x] **Latest production deploy matches the latest `master` commit.**
      Resolved 2026-05-20 by an explicit CLI deploy
      (`npx vercel --prod`, id `dpl_6aBbtSTZ198aLTAwYqbqxPvFVt2A`, alias
      `https://consentvault.vercel.app`). Homepage HTML confirmed to
      carry redesigned copy (`Review creator policies`, `Create case`,
      `Read the policy`). The Git auto-deploy item above remains open
      and only matters for future iterations.

## 2. Production environment variables

In Vercel → Project Settings → Environment Variables, the **Production**
environment must include:

- [ ] `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0x1a0f5fBF06fE00627176C0Fe26e64a7a008c9501`
- [ ] `NEXT_PUBLIC_SITE_URL=https://consentvault.vercel.app`

Redeploy after any change so the values are baked into the OG metadata
and the engine factory.

## 3. Wallet connect flow

- [ ] Open `https://consentvault.vercel.app/` in a **private/incognito
      window** with MetaMask installed.
- [ ] Click **Connect wallet** in the header.
- [ ] MetaMask prompts to add or switch to **Studionet (chain id `61999`)**.
      Approve.
- [ ] Header should show the truncated wallet address and the network name
      `Genlayer Studio Network`.

## 4. GenLayer trial transaction

- [ ] Open the seeded **Voice clone dispute** case
      (`/cases/case-voice-clone`).
- [ ] Click into the **Trial** route (`/cases/case-voice-clone/trial`).
- [ ] MetaMask should prompt for a `run_trial` write transaction. Approve.
- [ ] Wait for finalization (the frontend waits for the `FINALIZED`
      consensus state). The trial workspace then renders the consensus
      meter and validator breakdown.

## 5. Receipt + JSON export

- [ ] Open the **Receipt** route (`/cases/case-voice-clone/receipt`).
- [ ] The verdict banner renders the final verdict and consensus score.
- [ ] The **Receipt metadata** grid includes a **GenLayer issuer** row
      with the connected wallet address.
- [ ] Expand the **Export receipt as JSON** disclosure.
- [ ] Confirm the JSON includes a `wallet` block with:
  - [ ] `issuerAddress` — the connected wallet address
  - [ ] `chainId: 61999`
  - [ ] `networkName` — Studionet network name
  - [ ] `issuedVia: "genlayer-js"`

## 6. Recovery flows

These confirm the `TrialGuard` empty states work in production with the
live GenLayer engine.

- [ ] **Wallet disconnect.** Disconnect the site from MetaMask. Reload
      the trial route — it should fall back to the **"Connect wallet to
      run the GenLayer trial"** empty state with a connect-wallet CTA.
- [ ] **Missing contract.** In Vercel, blank
      `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS` and redeploy. The trial
      route should render **"GenLayer contract not configured"**.
- [ ] **Restore.** Put the contract address back and redeploy. The
      workspace returns.

## 7. Open Graph preview

- [ ] Paste `https://consentvault.vercel.app` into the LinkedIn or X
      composer, or run it through https://www.opengraph.xyz/.
- [ ] The preview should render a 1200×630 archive-style PNG with:
  - the `ConsentVault` eyebrow
  - the headline `A creator-facing tribunal for AI content consent disputes.`
  - a footer reading `Studionet · Chain id 61999`

## After QA

- If every item passes, the public demo is ready. Update the README
  badge or wherever the demo URL is shared, and link this checklist as
  the verification record.
- If anything fails, capture the failing step plus a screenshot or the
  receipt JSON, reopen the audit, and re-run the relevant automated
  spec locally.
