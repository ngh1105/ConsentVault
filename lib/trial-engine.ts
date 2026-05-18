import type { ConsentCase, ConsentPolicy, ValidatorJudgment, VerdictReceipt } from "@/lib/domain";
import type { GenLayerWalletMetadata } from "@/lib/genlayer/wallet";

export interface TrialInput {
  case: ConsentCase;
  policy: ConsentPolicy;
  wallet?: GenLayerWalletMetadata;
}

export interface TrialResult {
  judgments: ValidatorJudgment[];
  receipt: VerdictReceipt;
}

export interface TrialEngine {
  runTrial(input: TrialInput): Promise<TrialResult>;
}
