# GenLayer Wallet V1 — Review Fixes Design

**Date:** 2026-05-18
**Branch:** `codex/genlayer-wallet-v1`
**Source review:** caveman-review pass on the diff vs `master`

## Goal

Land all caveman-review findings (🟡 risk, 🔵 nit, and the architecture note) on
`codex/genlayer-wallet-v1` as a sequenced series of small, atomic commits. Each
commit must leave the branch shippable so we can stop at any batch and still
have a green demo.

## Non-goals

- Removing the TypeScript mock trial engine. It is the offline demo fixture and
  must keep working when `NEXT_PUBLIC_TRIAL_ENGINE` is unset.
- Loading custom fonts in `app/opengraph-image.tsx`. Defer until a visual
  regression is observed.
- Re-deriving `seededReceipt` on post-mount hydration. The demo does not
  exercise that path.

## Batches

The work is grouped into seven batches in correctness → architecture → polish
order. Each batch is one logical commit (or two for B7 if test files split
naturally).

### B1 — Verify-or-debunk `bg-destructive/8`

Tailwind 3.4 supports arbitrary `/N` opacity values from 0 to 100, so the
review's flag on `app/error.tsx:42` is likely a false positive. Run
`npm run build` and inspect the generated CSS for `bg-destructive/8`. If it
compiles, drop the finding and skip to B2. If it does not compile, replace
with `bg-destructive/10` to match the surrounding style.

### B2 — Wallet correctness (`components/providers/genlayer-wallet-provider.tsx`)

1. **Rebuild client on account/chain switch.** The current
   `handleAccountsChanged` only updates `address`. When a user switches
   accounts, the `walletClient` stored in state remains bound to the previous
   account and the next `writeContract` signs from the wrong signer.
   - On `accountsChanged`: rebuild `client` via
     `createGenLayerWalletClient(provider, nextAddress as 0x...)` after
     validating the address.
   - On `chainChanged`: rebuild `client` against the new chainId. (If the new
     chain is not Studionet, set `error` and `status = "error"`.)
2. **Validate address before casting.** Wrap every `as 0x${string}` cast in a
   `/^0x[0-9a-fA-F]{40}$/` guard. If invalid, set `status = "error"` and
   `error = "Wallet returned an invalid address"`.
3. **Stop swallowing `connectClientToStudionet` errors.** Replace
   `catch {}` with `catch (caught) { if (process.env.NODE_ENV !== "production") console.warn("[consentvault] studionet connect failed:", caught); }`.
4. **Re-poll provider on `window.focus`.** Add a `focus` listener that calls
   `getBrowserEthereumProvider()` and flips `status` from `"missing"` →
   `"disconnected"` if the provider becomes available after mount.

### B3 — Trial engine robustness (`lib/genlayer/genlayer-trial-engine.ts`)

1. **Validate `txHash`.** Replace
   `txHash = typeof rawHash === "string" ? rawHash : String(rawHash)` with a
   guard: if not a string starting with `0x` and length 66, throw
   `GenLayerTrialEngineExecutionError("writeContract returned an invalid transaction hash.")`.
2. **Stable validator fallback id.** Replace `validator-${index}` with
   `validator-${(validatorName || "unknown").toLowerCase().replace(/\s+/g, "-")}-${index}`
   so multiple unnamed judgments do not collide on React `key`.
3. **Drop `value: BigInt(0)`** from the `writeContract` args. The SDK does not
   require it for non-payable calls.
4. **Type the wait args.** Replace
   `as unknown as Parameters<typeof readClient.waitForTransactionReceipt>[0]`
   with a local `interface WaitForReceiptArgs { hash: string; status: "FINALIZED"; }`
   and pass it directly. If the SDK's actual type is incompatible, narrow the
   cast to `as Parameters<...>[0]` (single cast, not double).

### B4 — Contract correctness (`contracts/consent_vault_trial/main.py`)

1. **Reject empty `case_id`.** Add `assert case_id, "case_id must be non-empty"`
   at the top of `ConsentVaultTrial.run_trial` before building the prompt. The
   current behaviour silently skips persistence and surfaces as a confusing
   "contract returned empty payload" error from the frontend.
2. **Verdict-copy parity test.** GenVM single-file constraint blocks importing
   `aggregate.py` from `main.py`, so the duplication will stay. Add a
   golden-tuple parity regression in
   `contracts/consent_vault_trial/test_aggregate.py`:
   - Hard-code expected `(summary, recommended)` tuples for all 5 verdicts ×
     `support_count ∈ {1, 2, 3}` × `evidence_count ∈ {0, 5}`.
   - Assert `aggregate.verdict_copy(...)` equals the golden.
   - Use `ast.parse` on `main.py` to extract the source of `_verdict_copy`,
     `exec` it, and assert the same output. Drift between `main.py` and
     `aggregate.py` fails the test in CI.
   - Fallback if `ast` extraction proves brittle: assert `aggregate.py` matches
     the golden only and document a manual sync procedure in
     `contracts/consent_vault_trial/README.md`.

### B5 — Drift policy doc (architecture note, no code change)

Append a `## Drift policy` section to `contracts/consent_vault_trial/README.md`:

> The TypeScript `mock-trial-engine` and the Python contract aggregator are
> independent implementations. The mock engine is the offline demo fixture
> served when `NEXT_PUBLIC_TRIAL_ENGINE` is unset. The contract is canonical
> when `NEXT_PUBLIC_TRIAL_ENGINE=genlayer`. Receipt JSON may differ between
> the two paths — this is intentional for the hybrid MVP and is verified by
> the parity test in `test_aggregate.py` only for the Python verdict-copy
> rules. Re-evaluate after the demo.

### B6 — Frontend polish

1. **`components/wallet/wallet-connect-button.tsx`.** Extract a
   `buttonLabel(status, address)` helper at module scope (replaces the 4-level
   nested ternary). Keep the button enabled when `status === "missing"` and
   wire `onClick` to `() => window.location.reload()` so post-install retry
   works without a manual page refresh.
2. **`components/trial/trial-screen.tsx`.** Collapse `executeTrial` and the
   auto-run `useEffect` into a single
   `runTrial(cancelledRef: React.MutableRefObject<boolean>)` helper. The
   manual button uses a no-op cancellation ref. The effect uses a real one.
   Removes ~25 lines of duplicated state-machine wiring.
3. **`components/trial/trial-guard.tsx`.** Hoist `getConfiguredContractAddress`
   out of the component body. `NEXT_PUBLIC_*` vars are inlined at build, but
   the indirection inside render earns nothing.
4. **`app/opengraph-image.tsx`.** Replace the hard-coded `"Studionet · Chain id 61999"`
   with `\`Studionet · Chain id ${studionet.id}\``. Drop the `fontFamily`
   hints since `ImageResponse` ignores system fonts and falls back to a
   default — keeping the hint produces the same render but with misleading
   intent.
5. **`scripts/smoke-contract.mjs`.** Tighten address validation from
   `startsWith("0x")` to `/^0x[0-9a-fA-F]{40}$/.test(candidate)`. Print a
   precise message and `process.exit(2)` on failure.

### B7 — Tests

1. **Vitest** (`tests/lib/genlayer-wallet.test.ts` +
   `tests/lib/genlayer-trial-engine.test.ts`):
   - `accountsChanged` rebuilds `client` and `chainId`.
   - `chainChanged` rebuilds `client`.
   - Malformed address from `eth_requestAccounts` sets status `"error"`.
   - `runTrial` throws when `writeContract` returns `undefined`.
   - `runTrial` throws when `writeContract` returns a non-hex string.
2. **Pytest** (`contracts/consent_vault_trial/test_aggregate.py`):
   - `run_trial` raises `AssertionError` when `case_id == ""` (smoke via the
     pure Python `aggregate.py` since `main.py` requires the GenVM runtime).
   - Verdict-copy parity test described in B4.

Playwright is skipped — `meta.spec.ts` and `dashboard.spec.ts` already cover
the visible UI surface affected by these changes.

## Risks

1. **Chain-switch during in-flight `runTrial`.** Rebuilding `walletClient`
   mid-run could orphan the in-flight `writeContract`. The
   `walletClientRef` snapshot in `trial-screen.tsx:71` already shields runs
   from later context updates. Verify with a chainChange-during-runTrial test
   in B7. If a regression is observed, fall back to leaving the existing
   client untouched for `chainChanged` and only updating the displayed
   `chainId`.
2. **`ast` parity test brittleness.** Python AST shape is stable but parsing
   `main.py` adds a non-obvious test dependency. If maintenance becomes a
   tax, fall back to hard-coded golden tuples (still covers drift, simpler).
3. **`window.focus` re-poll storm.** Adding a focus listener inside the
   wallet provider could fire on every tab refocus. Acceptable cost; the
   listener is a single function call and a state update only fires when
   `status` actually changes.

## Verification

After all batches land:

- `npm run build` succeeds.
- `npm run lint` passes.
- `npm test` (Vitest) passes including new wallet/engine tests.
- `npm run test:e2e -- --grep dashboard` passes (sanity).
- `cd contracts/consent_vault_trial && pytest` passes including parity test.
- `npm run smoke:contract -- 0x<deployed-address>` returns the expected output
  (manual; only if a deployment exists).

## Out of scope

- Replacing the duplicated verdict-copy strings with codegen or a shared JSON
  resource. GenVM single-file constraint makes this a larger refactor than
  the demo budget allows. The parity test in B4 catches drift instead.
- Loading custom fonts in `ImageResponse`.
- Reactive re-derivation of `seededReceipt` after first render.
- Adding telemetry/observability for wallet errors.
