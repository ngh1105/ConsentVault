# ConsentVault

ConsentVault is a polished archive-style demo for reviewing AI content
consent disputes. It pairs a creator-facing policy + evidence workflow
with a **GenLayer Intelligent Contract** that produces verdict receipts
through three validator personas.

## Stack

- **Frontend:** Next.js 15 App Router + React 19 + TypeScript + Tailwind.
- **Wallet / chain:** [`genlayer-js`](https://docs.genlayer.com) talking to
  Studionet (chain id `61999`) via MetaMask.
- **Contract:** [`py-genlayer`](https://docs.genlayer.com) Intelligent
  Contract using `gl.eq_principle.prompt_comparative` (3 validators).
- **Tests:** Vitest + Testing Library, Playwright (e2e + axe + screenshots),
  pytest for the contract aggregation logic.
- **CI-friendly scripts:** `npm run lint`, `npm run build`,
  `npm run test`, `npm run test:e2e`, `npm run smoke:contract`,
  `npm run demo:capture`.

## Repo layout

```
app/               Next.js App Router pages, layout, OG image route
components/        UI: shell, wallet, dashboard, intake, evidence, trial, receipt
lib/               Domain, store, sample data, mock + GenLayer trial engines
lib/genlayer/      Wallet + read/write client helpers + GenLayerTrialEngine
contracts/consent_vault_trial/
                   GenLayer Intelligent Contract (main.py) + tested aggregate.py
docs/              demo-script, deploy-contract, deploy-vercel, research notes
tests/             Vitest unit tests + Playwright e2e (a11y, axe, meta, ...)
scripts/           smoke-contract.mjs (read-only smoke against deployed contract)
```

## Run locally (mock engine)

```bash
npm install
npm run dev
```

The app opens at http://localhost:3000 with the deterministic mock trial
engine. No wallet, no contract address, no network calls required.

## Run locally against a live GenLayer contract

1. Deploy the Intelligent Contract on Studionet — see
   [`docs/deploy-contract.md`](docs/deploy-contract.md).
2. Copy `.env.example` → `.env.local` and fill in:
   ```
   NEXT_PUBLIC_TRIAL_ENGINE=genlayer
   NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_ADDRESS
   ```
3. `npm run smoke:contract -- 0xYOUR_DEPLOYED_ADDRESS` to verify the
   contract is reachable.
4. `npm run dev`, open http://localhost:3000, click **Connect wallet**,
   approve Studionet in MetaMask, then run a trial — MetaMask will request
   a `run_trial` write transaction.

## Deploying the public demo

1. Deploy the contract per
   [`docs/deploy-contract.md`](docs/deploy-contract.md).
2. Push the repo to GitHub.
3. Follow [`docs/deploy-vercel.md`](docs/deploy-vercel.md) to wire the env
   vars + smoke-test the public URL.

The OG image (`/opengraph-image`) auto-generates a 1200×630 PNG with the
archive palette so social previews work out of the box.

## Engine swap (mock ⇄ GenLayer)

The trial engine is selected at runtime by the `NEXT_PUBLIC_TRIAL_ENGINE`
environment variable:

| Value      | Behavior                                                                  |
| ---------- | ------------------------------------------------------------------------- |
| _unset_    | Same as `mock` — deterministic local engine.                              |
| `mock`     | Deterministic engine in `lib/mock-trial-engine.ts`. No network.           |
| `genlayer` | Live engine in `lib/genlayer/genlayer-trial-engine.ts`; requires wallet + `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS`. Shows the TrialGuard block states when missing. |

Both engines satisfy the same `TrialEngine` interface and emit a
`VerdictReceipt` with the same shape, so all downstream UI (export, receipt
card, dashboard pills) is identical.

## Test pipeline

```bash
npm run lint      # eslint, no errors expected
npm run build     # next build, must succeed
npm run test      # vitest (currently 80+ passing)
npm run test:e2e  # playwright (22 e2e + 7 axe + 2 meta = 22 default; screenshots gated)
npm run demo:capture   # regenerates docs/screenshots/* via DEMO_CAPTURE=1
```

Contract aggregation rules ship with their own pytest harness:

```bash
cd contracts/consent_vault_trial
py -m pip install -r requirements-dev.txt
py -m pytest
```

## Demo URL

Live demo: **https://consentvault.vercel.app**

Studionet contract address (current deploy):
`0x1a0f5fBF06fE00627176C0Fe26e64a7a008c9501`

After running through the steps in [`docs/demo-script.md`](docs/demo-script.md),
the screenshots in [`docs/screenshots/`](docs/screenshots/) match the live
flow.

## License

Demo project — no production warranty. Pin contract addresses to known
deployments before sharing externally.
