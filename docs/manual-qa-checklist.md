# Manual QA Checklist

The release passes automated checks and production route smoke checks. The
remaining items require MetaMask, a funded Studionet account, and Vercel
project owner access.

Production URL: `https://consentvault.vercel.app`

Current production deploy:

- Deploy id: `dpl_FZPCDLxwLSMbG3hVuWup42oA3sLh`
- Created: 2026-05-22 22:01 ICT
- Deployment URL: `https://consentvault-n6cz89my1-ngh1105s-projects.vercel.app`

## 1. Vercel Deploy

- [ ] **Auto-deploy wired to `master`.** Open the Vercel dashboard for the
      `consentvault` project. Project Settings -> Git should show the
      `ngh1105/ConsentVault` repository connected with `master` as the
      production branch.
- [x] **Latest production deploy refreshed manually.** Resolved 2026-05-22 by
      `npx vercel --prod`, id `dpl_FZPCDLxwLSMbG3hVuWup42oA3sLh`, alias
      `https://consentvault.vercel.app`. Live route smoke checks returned 200
      for `/`, `/policy`, `/cases/new`, `/cases/case-voice-clone/trial`,
      `/cases/case-voice-clone/receipt`, and `/opengraph-image`.

## 2. Production Environment Variables

In Vercel -> Project Settings -> Environment Variables, the **Production**
environment must include:

- [ ] `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0x1a0f5fBF06fE00627176C0Fe26e64a7a008c9501`
- [ ] `NEXT_PUBLIC_SITE_URL=https://consentvault.vercel.app`

Redeploy after any change so values are baked into the app and OG metadata.

## 3. Wallet Connect Flow

- [ ] Open `https://consentvault.vercel.app/` in a private/incognito window
      with MetaMask installed.
- [ ] Click **Connect wallet** in the header.
- [ ] MetaMask prompts to add or switch to Studionet, chain id `61999`.
- [ ] Header shows the truncated wallet address and
      `Genlayer Studio Network`.

## 4. GenLayer Trial Transaction

- [ ] Open the seeded **Voice clone dispute** case:
      `/cases/case-voice-clone`.
- [ ] Open `/cases/case-voice-clone/trial`.
- [ ] MetaMask prompts for a `run_trial` write transaction.
- [ ] Approve and wait for `FINALIZED`.
- [ ] Trial workspace renders the consensus meter and validator breakdown.

## 5. Receipt And JSON Export

- [ ] Open `/cases/case-voice-clone/receipt`.
- [ ] Verdict banner renders the final verdict and consensus score.
- [ ] **Receipt metadata** includes a **GenLayer issuer** row.
- [ ] Expand **Export receipt as JSON**.
- [ ] JSON includes a `wallet` block with:
  - [ ] `issuerAddress`
  - [ ] `chainId: 61999`
  - [ ] `networkName`
  - [ ] `issuedVia: "genlayer-js"`

## 6. Recovery Flows

- [ ] **Wallet disconnected.** Disconnect the site from MetaMask and reload the
      trial route. It should show **Connect wallet to run the GenLayer trial**.
- [ ] **Missing contract.** Blank `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS` in
      Vercel and redeploy. The trial route should show
      **GenLayer contract not configured**.
- [ ] **Restore.** Put the contract address back and redeploy.

## 7. Open Graph Preview

- [ ] Paste `https://consentvault.vercel.app` into LinkedIn, X, or
      https://www.opengraph.xyz/.
- [ ] Preview renders the 1200x630 PNG with ConsentVault branding and the
      Studionet footer.

## After QA

- If every item passes, the public demo is ready.
- If anything fails, capture the failing step plus a screenshot or receipt JSON,
  then re-run the relevant local spec.
