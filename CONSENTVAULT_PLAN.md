# ConsentVault Build Plan

## Project Goal

Build **ConsentVault**, a Hybrid MVP for GenLayer that demonstrates an AI memory, likeness, and content consent dispute layer.

The demo should show how a creator defines an AI-use policy, how a suspicious AI output is submitted, how evidence is bundled, how GenLayer-style validators evaluate the case, and how the app produces a shareable consent verdict receipt.

## Core Thesis

AI systems increasingly reuse public content, voice, likeness, writing style, personal memory, and creator identity. The hard cases are contextual rather than binary: parody, fair use, remix, attribution, impersonation, consent withdrawal, and licensing can overlap.

ConsentVault positions GenLayer as the trust layer for those ambiguous disputes by combining evidence, policy, subjective judgment, and consensus.

## Recommended Build Mode

Use a **Hybrid MVP**:

- Frontend demo is fully usable and polished.
- Validator consensus is simulated first.
- Data structures mirror what a GenLayer Intelligent Contract would later consume.
- A future GenLayer adapter can replace the mock trial engine without redesigning the app.

## SDK And Stack

- **Next.js + React + TypeScript** for the application.
- **Tailwind CSS** for styling.
- **shadcn/ui** for polished app components.
- **lucide-react** for icons.
- **GenLayerJS SDK** for the future DApp adapter.
- **Viem** if low-level wallet or chain interaction is needed.
- **Python GenVM / py-genlayer** for a later Intelligent Contract prototype.
- **OpenAI SDK or another LLM adapter** only if automated claim/policy analysis is added after the first demo.
- **Playwright** for browser verification and demo screenshots.

## MVP Screens

1. **Dashboard**
   - Show sample consent cases.
   - Highlight case status: Draft, In Review, Verdict Ready.
   - Include a primary action to create or open a case.

2. **Consent Policy Builder**
   - Creator defines allowed AI use.
   - Creator defines blocked uses such as impersonation, voice cloning, persona simulation, or commercial remix.
   - Creator sets attribution and license requirements.

3. **Dispute Intake**
   - User submits suspicious AI output.
   - User links original source, AI output, platform URL, and optional notes.
   - App generates an evidence bundle preview.

4. **Evidence Workspace**
   - Compare original content and AI output side by side.
   - Show policy clauses that may apply.
   - Show source URLs, timestamps, and notes.

5. **GenLayer Consent Trial**
   - Simulate multiple validator judgments.
   - Each validator outputs verdict, reasoning, confidence, and cited evidence.
   - Consensus engine aggregates the judgments.

6. **Consent Verdict Receipt**
   - Final result: Allowed, Needs Attribution, Needs License, Impersonation Risk, or Violation.
   - Include confidence score, validator summary, evidence links, recommended next action.
   - Make the receipt shareable/exportable.

## Data Model

### ConsentPolicy

- `id`
- `creatorName`
- `creatorHandle`
- `allowedUses`
- `blockedUses`
- `attributionRules`
- `licenseRules`
- `jurisdictionNote`
- `createdAt`

### ConsentCase

- `id`
- `title`
- `status`
- `policyId`
- `originalContent`
- `aiOutput`
- `evidenceItems`
- `createdAt`

### EvidenceItem

- `id`
- `type`
- `title`
- `url`
- `description`
- `capturedAt`

### ValidatorJudgment

- `id`
- `validatorName`
- `verdict`
- `confidence`
- `reasoning`
- `citedEvidenceIds`

### VerdictReceipt

- `id`
- `caseId`
- `finalVerdict`
- `score`
- `summary`
- `recommendedAction`
- `judgments`
- `createdAt`

## Verdict Categories

- **Allowed**: AI use matches the policy and evidence does not show misuse.
- **Needs Attribution**: AI use may be acceptable if credit is added.
- **Needs License**: AI use appears commercial or derivative enough to require explicit permission.
- **Impersonation Risk**: Output imitates identity, voice, persona, or style in a misleading way.
- **Violation**: Output clearly conflicts with creator policy or consent restrictions.

## Milestones

### Milestone 1: Project Setup

- Create the Next.js app.
- Add TypeScript, Tailwind, shadcn/ui, and lucide-react.
- Create sample data for policies, cases, evidence, validator judgments, and receipts.

### Milestone 2: Core UI

- Build the dashboard.
- Build policy builder.
- Build dispute intake.
- Build evidence workspace.
- Build trial and receipt screens.

### Milestone 3: Mock Trial Engine

- Implement deterministic mock validator judgments from sample cases.
- Aggregate judgments into a final verdict.
- Generate a structured receipt object.

### Milestone 4: GenLayer-Ready Adapter

- Define an interface for trial engines.
- Add a mock implementation now.
- Add placeholder GenLayerJS adapter for future contract calls.
- Keep data structures compatible with future Intelligent Contract input.

### Milestone 5: Polish And Verification

- Add responsive layout.
- Add empty, loading, and error states.
- Verify app in browser with Playwright or in-app browser.
- Capture screenshots for demo.

## Demo Script

1. Open dashboard and select a sample case.
2. Show the creator's consent policy.
3. Show suspicious AI output against original content.
4. Open the evidence workspace.
5. Run the GenLayer Consent Trial.
6. Review validator reasoning.
7. Open the final Consent Verdict Receipt.
8. Explain how the mock trial engine can later be replaced by a GenLayer Intelligent Contract.

## Next Actions

1. Approve this plan.
2. Create the project scaffold.
3. Install UI and SDK dependencies.
4. Implement sample data and screen routing.
5. Build the dashboard and policy/case flow.
6. Implement the mock trial engine.
7. Add the receipt page.
8. Run browser verification.
9. Prepare a short demo walkthrough.

