import type { TrialEngine, TrialInput, TrialResult } from "@/lib/trial-engine";
import type { GenLayerWalletClient } from "@/lib/genlayer/wallet";

export type GenLayerTrialEngineConfig = {
  /** Contract address on the configured GenLayer chain. */
  contractAddress: `0x${string}` | null;
  /** Wallet-bound write client; required to submit run_trial transactions. */
  walletClient?: GenLayerWalletClient | null;
};

export class GenLayerTrialEngineNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GenLayerTrialEngineNotConfiguredError";
  }
}

/**
 * GenLayer-backed trial engine.
 *
 * Placeholder implementation: the runtime wiring lands in Task 5 once the
 * Intelligent Contract is deployed. We expose the constructor + interface
 * shape now so the factory + UI callers can be wired in this task without
 * regressing the mock engine path.
 */
export class GenLayerTrialEngine implements TrialEngine {
  constructor(private readonly config: GenLayerTrialEngineConfig) {}

  async runTrial(_input: TrialInput): Promise<TrialResult> {
    if (!this.config.contractAddress) {
      throw new GenLayerTrialEngineNotConfiguredError(
        "NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS is not set; cannot reach the GenLayer trial contract.",
      );
    }

    if (!this.config.walletClient) {
      throw new GenLayerTrialEngineNotConfiguredError(
        "GenLayer wallet client is not available; connect a wallet before running the trial.",
      );
    }

    throw new Error(
      "GenLayerTrialEngine.runTrial is not implemented yet (Task 5 wires the contract call).",
    );
  }
}
