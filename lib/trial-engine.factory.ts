import {
  GenLayerTrialEngine,
  type GenLayerTrialEngineConfig,
} from "@/lib/genlayer/genlayer-trial-engine";
import type { GenLayerWalletClient } from "@/lib/genlayer/wallet";
import { createMockTrialEngine } from "@/lib/mock-trial-engine";
import type { TrialEngine } from "@/lib/trial-engine";

export type TrialEngineKind = "mock" | "genlayer";

export type TrialEngineFactoryOptions = {
  /** Wallet-bound write client to forward to the GenLayer engine. Optional for mock. */
  walletClient?: GenLayerWalletClient | null;
};

/**
 * Resolve the active trial engine kind from `NEXT_PUBLIC_TRIAL_ENGINE`.
 *
 * Defaults to `"mock"` for unset / unrecognized values so dev + test runs work
 * without any environment configuration. Production builds set the env var to
 * `"genlayer"` to enable real contract calls.
 */
export function resolveTrialEngineKind(
  raw: string | undefined = process.env.NEXT_PUBLIC_TRIAL_ENGINE,
): TrialEngineKind {
  const normalized = (raw ?? "").trim().toLowerCase();
  return normalized === "genlayer" ? "genlayer" : "mock";
}

function readContractAddress(): GenLayerTrialEngineConfig["contractAddress"] {
  const value = (process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS ?? "").trim();
  return value.startsWith("0x") ? (value as `0x${string}`) : null;
}

/**
 * Pick the trial engine to use for the next run. Callers should invoke this
 * once per render where the wallet client may change so the GenLayer engine
 * always sees the freshest write client.
 */
export function getTrialEngine(options: TrialEngineFactoryOptions = {}): TrialEngine {
  const kind = resolveTrialEngineKind();

  if (kind === "genlayer") {
    return new GenLayerTrialEngine({
      contractAddress: readContractAddress(),
      walletClient: options.walletClient,
    });
  }

  return createMockTrialEngine();
}
