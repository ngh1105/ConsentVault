import type { ConsentCase, ConsentPolicy, ValidatorJudgment, VerdictReceipt } from "@/lib/domain";

export interface TrialInput {
  case: ConsentCase;
  policy: ConsentPolicy;
}

export interface TrialResult {
  judgments: ValidatorJudgment[];
  receipt: VerdictReceipt;
}

export interface TrialEngine {
  runTrial(input: TrialInput): Promise<TrialResult>;
}
