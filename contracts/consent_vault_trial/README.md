# ConsentVaultTrial GenLayer Contract

Intelligent Contract that powers ConsentVault's live verdict trial. The
frontend sends serialized `case` and `policy` payloads, the contract runs three
validator personas through `gl.eq_principle.prompt_comparative`, aggregates the
judgments, and stores one JSON result per case id.

## Files

- `main.py`: deployment-ready GenLayer contract. Logic is inlined because GenVM
  contracts are constrained to one file.
- `aggregate.py`: pure-Python mirror of deterministic aggregation logic used by
  pytest.
- `test_aggregate.py`: pytest coverage for priority, tie-breaking, scoring,
  copy templates, and `main.py` drift checks.
- `requirements-dev.txt`: pytest dependency for local contract tests.

## Run Tests

```powershell
cd contracts/consent_vault_trial
py -3 -m pytest
```

## Deploy With `genlayer-cli`

Prerequisites:

- `genlayer-cli` installed: `npm install -g genlayer-cli`
- A funded Studionet account from https://studio.genlayer.com

```bash
genlayer init
genlayer network set studionet
genlayer account import
genlayer deploy --contract contracts/consent_vault_trial/main.py
```

Copy the deployed address into `.env.local`:

```text
NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0xDEPLOYEDADDRESSHERE
```

## Smoke The Contract

After deployment, verify the read path from the app's SDK layer:

```bash
npm run smoke:contract -- 0xDEPLOYEDADDRESSHERE
```

This calls `get_result_by_case("__smoke__")`. A fresh contract returns an empty
string, confirming the contract is reachable and the ABI matches the frontend.

## Trial Shape

`run_trial(case_json, policy_json)` writes a finalized result into
`last_result_by_case`. `get_result_by_case(case_id)` returns a JSON string:

```json
{
  "judgments": [
    {
      "id": "validator-signal-house",
      "validatorName": "Signal House",
      "verdict": "Impersonation Risk",
      "confidence": 0.94,
      "reasoning": "...",
      "citedEvidenceIds": ["ev-imp-source", "ev-imp-output"]
    }
  ],
  "finalVerdict": "Impersonation Risk",
  "score": 92,
  "summary": "...",
  "recommendedAction": "...",
  "supportingEvidenceCount": 2,
  "supportingValidatorCount": 2,
  "caseId": "case-voice-clone"
}
```

The frontend wraps this with case timestamp and connected-wallet metadata to
build the final `VerdictReceipt`.

## Drift Policy

The GenLayer contract is the canonical trial engine. The pure-Python
`aggregate.py` mirror exists only for pytest coverage of deterministic
aggregation, copy, and scoring rules. Keep `main.py`, `aggregate.py`, and
`test_aggregate.py` in sync whenever verdict aggregation changes.
