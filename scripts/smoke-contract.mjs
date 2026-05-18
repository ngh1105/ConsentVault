#!/usr/bin/env node
/**
 * Read-only smoke test for the deployed ConsentVaultTrial contract.
 *
 * Usage:
 *   npm run smoke:contract -- 0xYOUR_DEPLOYED_ADDRESS
 * or with env var:
 *   NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0x... npm run smoke:contract
 *
 * Calls `get_result_by_case` with a synthetic case id. A freshly deployed
 * contract returns an empty string; a contract that has run a trial for that
 * case id returns a JSON-serialized result.
 */

import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const SMOKE_CASE_ID = "__smoke__";

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

function resolveContractAddress() {
  const fromCli = process.argv[2];
  const fromEnv = process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS;
  const candidate = (fromCli ?? fromEnv ?? "").trim();
  return ADDRESS_RE.test(candidate) ? candidate : null;
}

async function main() {
  const address = resolveContractAddress();
  if (!address) {
    console.error(
      "[smoke] Missing or malformed contract address. Pass a 0x-prefixed 40-hex-char address as the first arg or set NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS.",
    );
    process.exit(2);
  }

  console.log("[smoke] Calling get_result_by_case on", address);

  const client = createClient({ chain: studionet });
  const result = await client.readContract({
    address,
    functionName: "get_result_by_case",
    args: [SMOKE_CASE_ID],
    stateStatus: "accepted",
  });

  if (result === "" || result === null || result === undefined) {
    console.log(
      "[smoke] OK: contract reachable, no persisted result for the smoke case (expected on a fresh deploy).",
    );
    return;
  }

  console.log("[smoke] OK: contract returned a JSON payload:");
  try {
    console.log(JSON.stringify(JSON.parse(String(result)), null, 2));
  } catch {
    console.log(String(result));
  }
}

main().catch((error) => {
  console.error("[smoke] FAIL:", error);
  process.exit(1);
});
