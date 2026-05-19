# ConsentVault Demo Script

A walkthrough you can read out loud while clicking through the demo. Pairs
with the screenshots in `docs/screenshots/` (run `npm run demo:capture` to
regenerate them).

> **Engine selection:** the script works the same whether
> `NEXT_PUBLIC_TRIAL_ENGINE=mock` (deterministic local trial) or `=genlayer`
> (real contract on Studionet). For a public demo URL with the real engine,
> see `docs/deploy-vercel.md` and `docs/deploy-contract.md`.

---

## 0. Setup (off-stage)

- Open the public Vercel URL **or** run locally with `npm run dev`.
- Make sure MetaMask is unlocked and Studionet is added (the wallet provider
  prompts for the network on first connect).
- Optional but encouraged: open the GenLayer Studio in another tab so the
  audience can see the deployed contract receiving traffic.

---

## 1. Dashboard ledger (`/`)

> "ConsentVault is a verdict-style archive for AI content consent disputes.
> The dashboard surfaces the active docket: cases, policies, receipts."

- Point at the **Active tribunal signal** banner — number of verdict-ready
  cases.
- Highlight the **Case ledger** with sample disputes already seeded.
- Click **Connect wallet** in the header. MetaMask opens, signer is bound to
  Studionet, the badge updates to the connected address + network name.

📷 Screenshot: `01-dashboard.png`

## 2. Creator policy (`/policy`)

> "Every dispute starts with a creator policy: allowed uses, blocked uses,
> attribution and license rules. The policy builder turns that into the
> consent contract that validators reason over."

- Click **Policy** in the nav. Walk through the form fields and the
  preview panel that mirrors the saved policy.

📷 Screenshot: `02-policy.png`

## 3. New case intake (`/cases/new`)

> "When a creator or moderator wants a verdict, they file a case. We collect
> source, AI output, platform URLs, and notes — the evidence bundle that
> validators see at trial."

- Show the live evidence preview as you fill the form.
- Submit and let the app route to the new case overview.

📷 Screenshot: `03-new-case.png`

## 4. Case overview (`/cases/[id]`)

> "Each case becomes its own dossier: status, policy reference, evidence
> count, and three workflow handoffs to evidence, trial, and receipt."

📷 Screenshot: `04-case-overview.png`

## 5. Evidence workspace (`/cases/[id]/evidence`)

> "Open the evidence workspace to compare original content with the AI
> output side by side, see which policy clauses apply, and inspect the
> evidence timeline."

📷 Screenshot: `05-evidence.png`

## 6. GenLayer trial (`/cases/[id]/trial`)

> "Now the trial. With `NEXT_PUBLIC_TRIAL_ENGINE=genlayer`, this triggers a
> `run_trial` write transaction on the deployed Intelligent Contract. The
> contract uses `gl.eq_principle.prompt_comparative` to gather three
> validator judgments and aggregate them deterministically. With the mock
> engine, the same UI runs the deterministic logic locally — same shape,
> same receipt, no network call."

- Click **Re-run trial** to demonstrate the in-flight state (consensus
  meter, run state badge), then the completed validator breakdown.

📷 Screenshot: `06-trial.png`

## 7. Verdict receipt (`/cases/[id]/receipt`)

> "The trial output becomes a verdict receipt: final verdict, confidence
> score, validator summary, cited evidence, recommended next action, and —
> when the wallet is connected — the GenLayer issuer address + network."

- Use **Copy receipt JSON** to show the export flow (the same JSON that
  external systems can ingest).

📷 Screenshot: `07-receipt.png`

## 8. Adapter swap explanation (closer)

> "ConsentVault keeps the demo path live with a deterministic mock engine
> that mirrors the contract's verdict shape. Switching the public deploy
> from mock to GenLayer is a single env var (`NEXT_PUBLIC_TRIAL_ENGINE`)
> plus the deployed contract address. Everything downstream — receipts,
> exports, validator UI — stays identical because the engine interface
> agrees with the contract's JSON output."

- Optional: open `docs/research/genlayer-integration.md` to show the
  end-to-end contract → JS surface.

---

## Pre-record checklist

- `npm run lint && npm run build && npm run test && npm run test:e2e`
- `npm run demo:capture` — regenerates `docs/screenshots/`
- Studionet account funded (💧 button) if running with `NEXT_PUBLIC_TRIAL_ENGINE=genlayer`

## Recovery if the GenLayer trial stalls during the demo

- The trial screen surfaces a destructive banner with the underlying error.
- Click **Re-run trial** to retry once the wallet/network is healthy.
- If Studionet is down or the contract was reset, switch
  `NEXT_PUBLIC_TRIAL_ENGINE=mock` (local) or back out to the dashboard;
  the seeded demo data still produces a valid receipt.
