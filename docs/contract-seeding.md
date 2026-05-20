# Seeding ConsentVaultTrial cases on Studionet

This guide is the operator-facing companion to `scripts/seed-cases.mjs`. It
covers seeding the deployed `ConsentVaultTrial` contract with two
canonical demo cases:

1. **Impersonation dispute** — voice-clone endorsement (`seed-case-voice-clone`)
2. **Dataset consent dispute** — unlicensed training corpus
   (`seed-case-dataset-consent`)

The script is **dry-run only**. It prints the exact `genlayer-cli`
invocations and JSON payloads needed for each case but never sends a
transaction. Run the printed commands yourself so the signer prompt and
receipt land in your own terminal.

## Lint and validate the contract

Before re-seeding (or before re-deploying after any change to
`contracts/consent_vault_trial/main.py`), run the GenVM linter against
the contract source:

```powershell
# Windows PowerShell
$env:PYTHONIOENCODING = 'utf-8'
C:\Users\Admin\AppData\Local\Programs\Python\Python312\Scripts\genvm-lint.exe check contracts\consent_vault_trial\main.py
```

```bash
# bash / WSL — use the genvm-lint on PATH
PYTHONIOENCODING=utf-8 genvm-lint check contracts/consent_vault_trial/main.py
```

Note: the executable is `genvm-lint`, not `genvm-linter`. It ships with
the GenVM Python distribution.

Expected result on a clean checkout:

```
✓ Lint passed (3 checks)
✓ Validation passed
  Contract: ConsentVaultTrial
  Methods:
    - get_result_by_case (view)
    - run_trial (write)
```

The `Validation` step fetches the pinned `py-genlayer` SDK (see the
`# { "Depends": "py-genlayer:..." }` header in `main.py`). If that fetch
fails with `HTTP Error 404: Not Found`, retry once — the SDK store can
be transiently unreachable. Lint-only output (the first check) is still
authoritative for source-level issues.

## Preconditions

Before the printed commands will work end-to-end:

- `genlayer-cli` installed and on `PATH`:

  ```bash
  npm install -g genlayer-cli
  genlayer init
  genlayer network set studionet
  ```

- A funded Studionet account selected:

  ```bash
  genlayer account import      # or: genlayer account use <alias>
  ```

  Top up the account from https://studio.genlayer.com (click the 💧
  faucet button on the active account).

- The deployed contract address. Either pass it via `--address` or set
  `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS` in `.env.local`. The address is
  also expected to be present in the Vercel project's production env
  vars; see `docs/manual-qa-checklist.md`.

## Generate the seeding plan

From the repo root:

```bash
node scripts/seed-cases.mjs --address 0xYOUR_DEPLOYED_ADDRESS
```

If the address is omitted, the script prints `0xYOUR_DEPLOYED_ADDRESS` as
a placeholder so the output is still readable. Either way, the output is
a self-contained plan: the case + policy JSON for each seed, the
`genlayer write` command to seed it, and the `genlayer call` command to
read it back.

## Execute the printed commands

For each seed in the plan output:

1. Copy the `genlayer write` block. It includes the case JSON and policy
   JSON inline as the two positional arguments to `run_trial`.
2. Run it. `genlayer-cli` will prompt the selected signer for the
   transaction, then wait for `FINALIZED` consensus before returning a
   receipt.
3. Capture the printed transaction hash and block number — paste them
   into `docs/release-readiness.md` next to the seeded case id.
4. Copy the corresponding `genlayer call` block and run it to confirm
   the persisted JSON contains the expected `finalVerdict`.

Note: the current `genlayer-cli` argument parser attempts to coerce valid
JSON objects into dictionaries. The deployed `run_trial` method expects
two JSON-encoded strings (`case_json`, `policy_json`), so if the CLI
receipt shows `JSONDecodeError` or `run_trial() takes 3 positional
arguments but ... were given`, do not keep retrying the CLI form. Use the
same `genlayer-js` write path as the app (`args: [caseJson, policyJson]`)
so the contract receives strings.

## Seed record

The Studionet contract at
`0x1a0f5fBF06fE00627176C0Fe26e64a7a008c9501` was seeded on 2026-05-20
with signer `shieldtest`
(`0xD12e272d9b464B5287c50307321c1bB1f6092517`) through the
`genlayer-js` write path.

| Case id | Tx hash | Status | Result | Rounds | Verdict | Score |
| --- | --- | --- | --- | --- | --- | --- |
| `seed-case-voice-clone` | `0x4c5f88b57e583f06aefcadf38836c2a023131c2a86197913090519eff12ac3fb` | `FINALIZED` | `MAJORITY_AGREE` | 1 | `Violation` | 92 |
| `seed-case-dataset-consent` | `0xab8c0831ae6995ff5eeed51ca793fb32485a32728f7a4661d4f2f85d8289a0fb` | `FINALIZED` | `MAJORITY_AGREE` | 2 | `Violation` | 95 |

Read verification:

- `get_result_by_case("seed-case-voice-clone")` returned a 1,839 byte
  JSON result. Summary: `2 validators concluded the reuse conflicts
  directly with Mara Ellison's policy and the 3 cited records support
  enforcement-ready escalation.`
- `get_result_by_case("seed-case-dataset-consent")` returned a 1,893 byte
  JSON result. Summary: `2 validators concluded the reuse conflicts
  directly with Lior Hagen's policy and the 4 cited records support
  enforcement-ready escalation.`

## Smoke the read path from the frontend

After both seeds finalize:

```bash
npm run smoke:contract -- 0xYOUR_DEPLOYED_ADDRESS
```

This calls `get_result_by_case` for the synthetic `__smoke__` case id
and confirms the contract is reachable from `genlayer-js` with the same
ABI the app uses. The two seeded cases use distinct ids
(`seed-case-voice-clone`, `seed-case-dataset-consent`) so the smoke read
returns its usual empty string.

## Why the script is dry-run only

`run_trial` is a write transaction that must wait for Studionet
consensus to finalize. Doing that from a non-interactive Node script
would require either:

- importing a private key into the script (rejected — secrets must stay
  out of the repo), or
- pretending an automated signer exists when in practice operators
  approve the tx in their own CLI.

Printing the exact commands keeps the signer prompt, the tx hash, and
the receipt in the operator's own terminal where they can review the
payload before signing. If automated seeding is needed later, wire it
through the existing `genlayer-js` client used in
`scripts/smoke-contract.mjs` and source the signer from a managed
secret, never from the repo.

## Troubleshooting

- **"Insufficient funds"** — top up the active account from the
  Studionet faucet (https://studio.genlayer.com).
- **"Network mismatch"** — `genlayer network set studionet` and confirm
  the active account is on chain id `61999`.
- **`run_trial` returns nothing** — write transactions only resolve once
  Studionet consensus finalizes. Wait for the `FINALIZED` status before
  reading back via `get_result_by_case`.
- **Studionet was reset** — contract state is wiped on Studio reset.
  Redeploy per `docs/deploy-contract.md`, update
  `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS`, and re-seed.
