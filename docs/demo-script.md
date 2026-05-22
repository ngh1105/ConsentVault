# ConsentVault Demo Script

A concise walkthrough for presenting the live GenLayer-backed flow. Pair this
with the screenshots in `docs/screenshots/`; regenerate them with
`npm run demo:capture`.

## 0. Setup

- Open the public Vercel URL or run locally with `npm run dev`.
- Confirm `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS` points at the deployed
  Studionet contract.
- Unlock MetaMask and make sure Studionet can be added or selected.
- Optional: keep GenLayer Studio open in another tab to show contract activity.

## 1. Dashboard (`/`)

> "ConsentVault is a verdict archive for AI content consent disputes. The
> dashboard surfaces active cases, creator policies, receipt status, and the
> current validator signal."

- Highlight active cases, receipts issued, and validators online.
- Open a seeded case from the case ledger.
- Connect the wallet from the header and approve Studionet.

Screenshot: `01-dashboard.png`

## 2. Creator Policy (`/policy`)

> "Every dispute starts with a creator policy: allowed uses, blocked uses,
> attribution requirements, license rules, and jurisdiction notes."

- Show how the policy form maps creator intent into a structured review object.
- Point out the live policy preview.

Screenshot: `02-policy.png`

## 3. New Case Intake (`/cases/new`)

> "A case bundles source material, generated output, platform context, and
> notes into the evidence package validators will inspect."

- Show the evidence preview and required fields.
- Submit or open the draft case to continue the workflow.

Screenshot: `03-new-case.png`

## 4. Case Overview (`/cases/[id]`)

> "Each dispute has a dossier with policy linkage, evidence count, status, and
> handoffs to evidence review, trial, and receipt."

Screenshot: `04-case-overview.png`

## 5. Evidence Workspace (`/cases/[id]/evidence`)

> "The evidence workspace compares source and AI output side by side, links the
> relevant policy clauses, and keeps the timeline inspectable."

Screenshot: `05-evidence.png`

## 6. GenLayer Trial (`/cases/[id]/trial`)

> "The trial route submits `run_trial` to the deployed GenLayer Intelligent
> Contract. The contract asks three validator personas for comparative
> judgments, aggregates the result, and stores the verdict by case id."

- If MetaMask prompts, approve the write transaction.
- Wait for finalization.
- Review the consensus meter and validator breakdown.

Screenshot: `06-trial.png`

## 7. Verdict Receipt (`/cases/[id]/receipt`)

> "The finalized trial becomes a receipt: final verdict, confidence score,
> validator reasoning, cited evidence, recommended action, and wallet issuer
> metadata when a wallet signed the run."

- Expand "Export receipt as JSON" to show the portable output.

Screenshot: `07-receipt.png`

## 8. Close

> "The product path is fully GenLayer-backed: policy and evidence are collected
> in the app, the wallet signs the trial transaction, and the receipt UI reads
> the contract's JSON output."

## Pre-Record Checklist

- `npm run lint`
- `npm run build`
- `npm test`
- `npm run test:e2e`
- `npm run smoke:contract -- 0x1a0f5fBF06fE00627176C0Fe26e64a7a008c9501`
- Studionet account funded and MetaMask ready

## Recovery

- If the trial stalls, retry once with **Re-run trial** after confirming the
  wallet and network are healthy.
- If Studionet was reset, redeploy the contract and update
  `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS`.
- If wallet access is unavailable, use the seeded dashboard and receipt routes
  to present the read-only archive and export experience.
