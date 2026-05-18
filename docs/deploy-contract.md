# Deploy ConsentVaultTrial to Studionet

This guide assumes you already have:

- `genlayer-cli` installed (`npm install -g genlayer-cli`)
- A Studionet wallet (open https://studio.genlayer.com → connect MetaMask
  → click the 💧 button to mint test GEN tokens)
- The ConsentVault repo cloned locally with dependencies installed
  (`npm install`)

## 1. Configure the CLI

```bash
genlayer init                # one-time, sets up CLI config
genlayer network set studionet
genlayer account list        # see what's already imported
```

If your funded Studionet account isn't in the list, import it via
`genlayer account import` (CLI will prompt for the private key) or use
`genlayer account create` to mint a fresh account, then send some test GEN
to it from the Studio UI.

```bash
genlayer account use <alias>
```

## 2. Deploy

From the repo root:

```bash
genlayer deploy --contract contracts/consent_vault_trial/main.py
```

The CLI prints the deployed contract address — copy it.

## 3. Wire the address into the frontend

Create `.env.local` (gitignored) at the repo root:

```
NEXT_PUBLIC_TRIAL_ENGINE=genlayer
NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_ADDRESS
```

`.env.example` shows the full set of accepted variables.

## 4. Smoke test the deployment

```bash
npm run smoke:contract -- 0xYOUR_DEPLOYED_ADDRESS
```

This calls `get_result_by_case` for a synthetic case id (`__smoke__`). A
freshly deployed contract returns an empty string, confirming the read path
and ABI match what the frontend expects.

## 5. (Optional) Run a full trial from the CLI

```bash
genlayer write \
  --address 0xYOUR_DEPLOYED_ADDRESS \
  --function run_trial \
  --args '["{\"id\":\"smoke\",\"title\":\"Smoke\",\"evidenceItems\":[]}", "{\"creatorName\":\"Smoke\",\"allowedUses\":[],\"blockedUses\":[]}"]'

genlayer call \
  --address 0xYOUR_DEPLOYED_ADDRESS \
  --function get_result_by_case \
  --args '["smoke"]'
```

The second call returns the JSON-serialized trial result.

## Troubleshooting

- **"Insufficient funds"**: open https://studio.genlayer.com, click 💧 on
  the active account in the account selector to top up.
- **"Network mismatch"** in the frontend: the wallet is connected to a
  different chain. Use the wallet UI to switch to Studionet (chain id
  `61999`) or hit the connect button again — the app calls
  `client.connect("studionet")` automatically.
- **`run_trial` returns nothing** in MetaMask popup: this method is a
  write transaction and only resolves once consensus finalizes. Wait for
  the receipt; the frontend waits for `FINALIZED` status.
- **Contract code redeploy**: Studionet state is temporary. After a Studio
  reset you'll need to redeploy and update `NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS`.
