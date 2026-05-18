# ConsentVaultTrial — GenLayer Intelligent Contract

Intelligent Contract that powers ConsentVault's verdict trial. The frontend
sends a serialized `case` + `policy` bundle, the contract runs three validator
personas via `gl.eq_principle.prompt_comparative` and aggregates the
judgments into a final verdict + score that mirrors `lib/verdict.ts`.

## Files

- `main.py` — the deployment-ready contract. Single file, all logic inlined
  because GenVM contracts are constrained to one file.
- `aggregate.py` — pure-Python mirror of the deterministic aggregation logic
  used by pytest. Keep in sync with `main.py` whenever the verdict rules
  change.
- `test_aggregate.py` — pytest covering priority + tie-breaking + scoring +
  copy templates. No GenLayer SDK or LLM access required.
- `requirements-dev.txt` — pytest only.

## Running tests

```bash
cd contracts/consent_vault_trial
python -m venv .venv
.venv\Scripts\activate     # PowerShell on Windows
# or: source .venv/bin/activate on macOS / Linux
pip install -r requirements-dev.txt
pytest
```

## Deploying with `genlayer-cli`

Pre-requisites:
- `genlayer-cli` installed (`npm install -g genlayer-cli`).
- A funded Studionet account — open https://studio.genlayer.com, click the 💧
  faucet button to mint test GEN.

```bash
genlayer init                  # one-time CLI setup
genlayer network set studionet
genlayer account import        # import the account that holds the test GEN
                               # (or: genlayer account use <existing-alias>)

genlayer deploy --contract contracts/consent_vault_trial/main.py
# Output prints the deployed contract address.
```

Copy the printed contract address into `.env.local`:

```
NEXT_PUBLIC_TRIAL_ENGINE=genlayer
NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0xDEPLOYEDADDRESSHERE
```

## Smoke calling the contract

After deploy, sanity-check `run_trial` with a sample case:

```bash
genlayer write \
  --address 0xDEPLOYEDADDRESSHERE \
  --function run_trial \
  --args '["{\"id\":\"smoke\",\"title\":\"Smoke\",\"evidenceItems\":[]}", "{\"creatorName\":\"Smoke\",\"allowedUses\":[],\"blockedUses\":[]}"]'

genlayer call \
  --address 0xDEPLOYEDADDRESSHERE \
  --function get_result_by_case \
  --args '["smoke"]'
```

The second call returns a JSON string with `judgments`, `finalVerdict`,
`score`, `summary`, and `recommendedAction`.

## Storage shape

`last_result_by_case: TreeMap[str, str]` — one persisted result per case id.
The returned JSON object has this shape:

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
    },
    ...
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

The frontend wraps this with case timestamp + connected-wallet metadata to
build the final `VerdictReceipt`.
