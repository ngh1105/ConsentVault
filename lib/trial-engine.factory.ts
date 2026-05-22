import {
  GenLayerTrialEngine,
  type GenLayerTrialEngineConfig,
} from "@/lib/genlayer/genlayer-trial-engine";
import type { GenLayerWalletClient } from "@/lib/genlayer/wallet";
import type { TrialEngine } from "@/lib/trial-engine";

export type TrialEngineFactoryOptions = {
  /** Wallet-bound write client used to submit GenLayer trial transactions. */
  walletClient?: GenLayerWalletClient | null;
};

function readContractAddress(): GenLayerTrialEngineConfig["contractAddress"] {
  const value = (process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS ?? "").trim();
  return value.startsWith("0x") ? (value as `0x${string}`) : null;
}

/**
 * Build the live GenLayer trial engine. Callers should invoke this once per
 * render where the wallet client may change so the engine always sees the
 * freshest write client.
 */
export function getTrialEngine(options: TrialEngineFactoryOptions = {}): TrialEngine {
  return new GenLayerTrialEngine({
    contractAddress: readContractAddress(),
    walletClient: options.walletClient,
  });
}
