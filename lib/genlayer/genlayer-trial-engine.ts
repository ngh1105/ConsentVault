import type { ConsentCase, ConsentPolicy, ValidatorJudgment, VerdictCategory, VerdictReceipt } from "@/lib/domain";
import type { TrialEngine, TrialInput, TrialResult } from "@/lib/trial-engine";
import {
  createGenLayerReadClient,
  type GenLayerReadClient,
  type GenLayerWalletClient,
} from "@/lib/genlayer/wallet";

export type GenLayerTrialEngineConfig = {
  /** Contract address on the configured GenLayer chain. */
  contractAddress: `0x${string}` | null;
  /** Wallet-bound write client; required to submit run_trial transactions. */
  walletClient?: GenLayerWalletClient | null;
  /** Optional override for the read client (used by tests). */
  readClient?: GenLayerReadClient | null;
};

export class GenLayerTrialEngineNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GenLayerTrialEngineNotConfiguredError";
  }
}

export class GenLayerTrialEngineExecutionError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "GenLayerTrialEngineExecutionError";
  }
}

const VALID_VERDICTS: ReadonlySet<VerdictCategory> = new Set([
  "Allowed",
  "Needs Attribution",
  "Needs License",
  "Impersonation Risk",
  "Violation",
]);

type RawJudgment = {
  id?: unknown;
  validatorName?: unknown;
  verdict?: unknown;
  confidence?: unknown;
  reasoning?: unknown;
  citedEvidenceIds?: unknown;
};

type RawTrialPayload = {
  judgments?: unknown;
  finalVerdict?: unknown;
  score?: unknown;
  summary?: unknown;
  recommendedAction?: unknown;
};

function ensureString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function ensureNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function ensureVerdict(value: unknown): VerdictCategory {
  if (typeof value === "string" && VALID_VERDICTS.has(value as VerdictCategory)) {
    return value as VerdictCategory;
  }
  throw new GenLayerTrialEngineExecutionError(
    `Contract returned an unrecognized verdict category: ${String(value)}`,
  );
}

function ensureStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((entry): entry is string => typeof entry === "string");
}

function normalizeJudgment(raw: RawJudgment, index: number): ValidatorJudgment {
  return {
    id: ensureString(raw.id, `validator-${index}`),
    validatorName: ensureString(raw.validatorName, `Validator ${index + 1}`),
    verdict: ensureVerdict(raw.verdict),
    confidence: ensureNumber(raw.confidence),
    reasoning: ensureString(raw.reasoning),
    citedEvidenceIds: ensureStringArray(raw.citedEvidenceIds),
  };
}

function parsePayload(raw: string): {
  judgments: ValidatorJudgment[];
  finalVerdict: VerdictCategory;
  score: number;
  summary: string;
  recommendedAction: string;
} {
  let parsed: RawTrialPayload;
  try {
    parsed = JSON.parse(raw) as RawTrialPayload;
  } catch (error) {
    throw new GenLayerTrialEngineExecutionError(
      "Contract returned non-JSON payload from get_result_by_case.",
      error,
    );
  }

  if (!Array.isArray(parsed.judgments)) {
    throw new GenLayerTrialEngineExecutionError(
      "Contract payload is missing the judgments array.",
    );
  }

  const judgments = (parsed.judgments as RawJudgment[]).map((raw, index) =>
    normalizeJudgment(raw, index),
  );

  const finalVerdict = ensureVerdict(parsed.finalVerdict);
  const score = Math.max(0, Math.min(100, Math.round(ensureNumber(parsed.score))));
  const summary = ensureString(parsed.summary);
  const recommendedAction = ensureString(parsed.recommendedAction);

  return { judgments, finalVerdict, score, summary, recommendedAction };
}

function buildReceipt(args: {
  consentCase: ConsentCase;
  policy: ConsentPolicy;
  payload: ReturnType<typeof parsePayload>;
  walletMetadata: TrialInput["wallet"];
  txHash: string;
}): VerdictReceipt {
  const { consentCase, payload, walletMetadata, txHash } = args;
  return {
    id: `receipt-${consentCase.id}-${txHash.slice(0, 10)}`,
    caseId: consentCase.id,
    finalVerdict: payload.finalVerdict,
    score: payload.score,
    summary: payload.summary,
    recommendedAction: payload.recommendedAction,
    judgments: payload.judgments,
    createdAt: new Date().toISOString(),
    wallet: walletMetadata,
  };
}

/** Result statuses that signal a successful execution we can read state from. */
const SUCCESS_RESULT_NAMES = new Set([
  "FINISHED_WITH_RETURN",
  "FINALIZED_WITH_RETURN",
  "Successful",
]);

/**
 * GenLayer-backed trial engine. Submits `run_trial` as a write transaction,
 * waits for finalization, then reads `get_result_by_case` to fetch the
 * persisted JSON payload and build a `VerdictReceipt` compatible with the UI.
 */
export class GenLayerTrialEngine implements TrialEngine {
  constructor(private readonly config: GenLayerTrialEngineConfig) {}

  async runTrial(input: TrialInput): Promise<TrialResult> {
    const { contractAddress, walletClient } = this.config;

    if (!contractAddress) {
      throw new GenLayerTrialEngineNotConfiguredError(
        "NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS is not set; cannot reach the GenLayer trial contract.",
      );
    }

    if (!walletClient) {
      throw new GenLayerTrialEngineNotConfiguredError(
        "GenLayer wallet client is not available; connect a wallet before running the trial.",
      );
    }

    const readClient = this.config.readClient ?? createGenLayerReadClient();

    const caseJson = JSON.stringify(input.case);
    const policyJson = JSON.stringify(input.policy);

    let txHash: string;
    try {
      const rawHash = (await walletClient.writeContract({
        address: contractAddress,
        functionName: "run_trial",
        args: [caseJson, policyJson],
        value: BigInt(0),
      })) as unknown;
      txHash = typeof rawHash === "string" ? rawHash : String(rawHash);
    } catch (error) {
      throw new GenLayerTrialEngineExecutionError(
        "writeContract for run_trial failed; user may have rejected the transaction or the network is unreachable.",
        error,
      );
    }

    let receiptStatus: { txExecutionResultName?: string } | null = null;
    try {
      const waitArgs = {
        hash: txHash,
        status: "FINALIZED",
      } as unknown as Parameters<typeof readClient.waitForTransactionReceipt>[0];
      receiptStatus = (await readClient.waitForTransactionReceipt(waitArgs)) as {
        txExecutionResultName?: string;
      };
    } catch (error) {
      throw new GenLayerTrialEngineExecutionError(
        "Timed out waiting for the run_trial transaction to finalize.",
        error,
      );
    }

    if (
      receiptStatus &&
      typeof receiptStatus.txExecutionResultName === "string" &&
      !SUCCESS_RESULT_NAMES.has(receiptStatus.txExecutionResultName)
    ) {
      throw new GenLayerTrialEngineExecutionError(
        `run_trial finalized with non-success result: ${receiptStatus.txExecutionResultName}`,
      );
    }

    let resultRaw: unknown;
    try {
      resultRaw = await readClient.readContract({
        address: contractAddress,
        functionName: "get_result_by_case",
        args: [input.case.id],
      });
    } catch (error) {
      throw new GenLayerTrialEngineExecutionError(
        "readContract for get_result_by_case failed.",
        error,
      );
    }

    if (typeof resultRaw !== "string" || resultRaw.length === 0) {
      throw new GenLayerTrialEngineExecutionError(
        "Contract returned an empty result payload; the trial may not have finalized correctly.",
      );
    }

    const payload = parsePayload(resultRaw);
    const receipt = buildReceipt({
      consentCase: input.case,
      policy: input.policy,
      payload,
      walletMetadata: input.wallet,
      txHash,
    });

    return { judgments: payload.judgments, receipt };
  }
}
