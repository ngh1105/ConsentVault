# Deploy ConsentVault to Vercel

This is a manual step that needs your Vercel account. The repo is otherwise
deploy-ready: Next.js 15 App Router, no custom server, no env-only build
secrets.

## Prerequisites

- A Vercel account (free Hobby plan is enough for the demo).
- The ConsentVaultTrial contract deployed on Studionet — see
  `docs/deploy-contract.md`. You'll need the contract address for the
  environment variables below.

## 1. Import the repo

1. Go to https://vercel.com/new.
2. Click **Import Git Repository** and select your fork of ConsentVault.
3. Vercel auto-detects Next.js. Leave the build settings as defaults
   (`next build`, output `.next`).

## 2. Configure environment variables

In **Project Settings → Environment Variables**, add these for the
**Production** environment (and **Preview** if you want PR previews to
hit the live contract):

| Name                                | Value                                                        |
| ----------------------------------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_TRIAL_ENGINE`          | `genlayer`                                                   |
| `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS` | `0x...` (contract address from `docs/deploy-contract.md`) |
| `NEXT_PUBLIC_SITE_URL`              | `https://<your-project>.vercel.app` (after first deploy)     |

> If you'd rather keep the public demo on the deterministic mock engine,
> set `NEXT_PUBLIC_TRIAL_ENGINE=mock` and skip the contract address.

## 3. Trigger the first deploy

Click **Deploy**. Vercel runs `npm install && npm run build`. After it
finishes you get a URL like `https://consentvault-xxxx.vercel.app`.

If you set `NEXT_PUBLIC_SITE_URL` after the first deploy, redeploy once so
the value is baked into the OG metadata.

## 4. Smoke test the deployment

Open the URL in a private window with MetaMask installed:

- [ ] **Dashboard** loads, "Connect wallet" button visible.
- [ ] Click **Connect wallet** → MetaMask prompts for Studionet (chain id
      `61999`). Approve. Header shows the connected address.
- [ ] Open the **Voice clone dispute** sample case.
- [ ] Visit the **Trial** route. With `genlayer` engine, you should see
      MetaMask request a `run_trial` write transaction. Approve and wait
      for finalization.
- [ ] Receipt route shows the verdict + GenLayer issuer + transaction
      result.
- [ ] **Export receipt as JSON** — expand the disclosure on the receipt
      route, copy the JSON payload, paste it somewhere; confirm it
      includes the `wallet` block.
- [ ] On the dashboard, **OG image preview** in social sharing tools shows
      the archive-style 1200x630 image (paste the URL into LinkedIn or
      X composer, or use https://www.opengraph.xyz/).

## 5. Recovery flows to verify

- [ ] Disconnect the wallet from MetaMask. Trial route falls back to the
      "Connect wallet to run the GenLayer trial" guard.
- [ ] In Vercel, blank `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS` and
      redeploy. Trial route shows "GenLayer contract not configured".
- [ ] Restore the address and redeploy.

## Notes on Studionet ephemerality

Studionet state is temporary and may be reset. After a reset, the
`run_trial` calls will succeed (new contract instance) but
`get_result_by_case` will be empty for older cases. If your demo URL
suddenly shows empty receipts, redeploy the contract and update
`NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS`.
