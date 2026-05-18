# Snap Fire-and-Forget Connect — Soft Regression on Initial Path

**Date:** 2026-05-18
**Branch (origin):** `codex/genlayer-wallet-v1`
**Source:** Surfaced while landing B2 (wallet correctness) of the
GenLayer wallet v1 review-fix plan.

## Goal

Make `connectClientToStudionet` deterministic on the first wallet
connect — surface failures the user can act on, and ensure the trial
engine waits for Studionet readiness before issuing `run_trial` — without
re-introducing the unhandled-promise warning B2 cleaned up.

## Problem

`components/providers/genlayer-wallet-provider.tsx:71` invokes
`connectClientToStudionet(next)` as a fire-and-forget call inside the
initial connect path. B2 swapped the silent `catch {}` for a non-prod
`console.warn`, but the underlying behaviour is unchanged: when the Snap
install or `wallet_invokeSnap` step rejects, the wallet provider still
flips `status = "connected"` and leaves the trial engine to discover the
broken Studionet binding only when `run_trial` fails downstream.

Symptoms observed:

- First-time users see "Connect successful" UI, then a confusing
  contract-execution error on the next button press.
- Returning users with an outdated Snap version silently fail at the
  Studionet bridging step until they refresh.

## Non-goals

- Re-implementing Snap installation flows.
- Synchronously gating the wallet button on Studionet readiness.
- Building a global retry queue. One explicit retry is enough.

## Approach

1. **Track Studionet readiness as first-class state.** Extend the wallet
   context with `studionetStatus: "idle" | "connecting" | "ready" |
   "error"` plus an `error` string. Do not block `status = "connected"`
   on this — keep the wallet usable for non-Studionet ops.
2. **Await the Snap connect inside the connect handler** with proper
   error capture, instead of `void connectClientToStudionet(next)`. On
   failure: set `studionetStatus = "error"` and surface a concrete
   message.
3. **Block trial submission on `studionetStatus === "ready"`.** Update
   `components/trial/trial-guard.tsx` to render a retry banner when the
   wallet is connected but Studionet is not ready, with a button that
   re-runs `connectClientToStudionet(walletClient)`.
4. **Auto-retry once on `accountsChanged` rebuild.** When B2 rebuilds
   the client for a new account, fire one Studionet connect attempt
   (with the same error capture) so the user does not have to click
   retry every account switch.

## Verification

1. Vitest suite green, including new test:
   - When `connectClientToStudionet` rejects, the context exposes
     `studionetStatus: "error"` and the trial guard renders the retry
     UI.
2. Manual sanity in browser:
   - Disable the GenLayer Snap → connect wallet → confirm retry banner.
   - Re-enable Snap, click retry → trial submission proceeds.
3. No Playwright change required. Add a focused unit test on
   `genlayer-wallet-provider.test.tsx` rather than touching E2E.

## Risks

1. **`genlayer-js` does not expose a stable error type.** If the SDK
   throws opaque errors, the user-facing message degrades to a generic
   string.
2. **Retry storm during account-switch loops.** Wrap the auto-retry in a
   debounce keyed on `(address, chainId)`.
3. **Breaking demo flow.** The mock trial engine must remain unaffected
   when `NEXT_PUBLIC_TRIAL_ENGINE` is unset — guard the trial-guard
   retry UI on `engine === "genlayer"`.

## Out of scope

- Telemetry for Studionet handshake failures.
- Persisting retry state across reloads.
- Snap version-pinning UX.
