# GenLayer Wallet V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add lightweight GenLayer wallet connection to ConsentVault and attach wallet metadata to generated receipts.

**Architecture:** Use `genlayer-js` as wallet/client boundary and keep wallet state in a small client provider. UI reads wallet state through a shell widget; trial receipt generation receives optional wallet metadata but still uses the existing deterministic mock trial engine.

**Tech Stack:** Next.js App Router, React, TypeScript, genlayer-js, Vitest, Testing Library, Playwright.

---

## File Map

- Create: `lib/genlayer/wallet.ts` — wallet types, address formatting, provider detection, metadata helpers.
- Create: `components/providers/genlayer-wallet-provider.tsx` — client wallet provider/hook using `genlayer-js`.
- Create: `components/wallet/wallet-connect-button.tsx` — shell wallet UI.
- Modify: `app/layout.tsx` — wrap app in wallet provider.
- Modify: `components/site-shell.tsx` — render wallet button near primary action.
- Modify: `lib/domain.ts` — add optional `wallet` metadata on `VerdictReceipt`.
- Modify: `lib/mock-trial-engine.ts` / `lib/trial-engine.ts` — accept optional receipt metadata.
- Modify: `components/trial/trial-screen.tsx` — pass connected wallet metadata into trial reruns.
- Modify: receipt UI/export tests — show/export wallet metadata.

## Tasks

### Task 1: Wallet helpers and SDK dependency
- [ ] Install `genlayer-js`.
- [ ] Add failing tests for short address + metadata creation.
- [ ] Implement `lib/genlayer/wallet.ts`.
- [ ] Run targeted tests.

### Task 2: Wallet provider and shell UI
- [ ] Add failing component tests for disconnected/connected/missing-wallet states.
- [ ] Implement provider and wallet connect button.
- [ ] Wrap layout and render button in shell.
- [ ] Run component tests.

### Task 3: Receipt wallet metadata
- [ ] Add failing trial/store/export tests proving connected wallet metadata reaches receipt.
- [ ] Extend domain + trial input + mock trial receipt creation.
- [ ] Display metadata on receipt card/export JSON.
- [ ] Run targeted tests.

### Task 4: Verification and review
- [ ] Run `npm run test`, `npm run lint`, `npm run build`, `npm run test:e2e`.
- [ ] Send diff to persistent Claude Code reviewer session.
- [ ] Fix review blockers.
- [ ] Commit.
