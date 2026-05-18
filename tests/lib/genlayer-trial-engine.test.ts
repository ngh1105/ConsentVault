import { describe, expect, it, vi } from "vitest";
import {
  GenLayerTrialEngine,
  GenLayerTrialEngineExecutionError,
  GenLayerTrialEngineNotConfiguredError,
} from "@/lib/genlayer/genlayer-trial-engine";
import type { TrialInput } from "@/lib/trial-engine";
import { impersonationCase, restrictivePolicy } from "@/lib/sample-data";

const TEST_ADDRESS = "0xabcdef0123456789abcdef0123456789abcdef01" as const;
const TEST_TX_HASH =
  "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd" as const;

function buildInput(overrides: Partial<TrialInput> = {}): TrialInput {
  return {
    case: impersonationCase,
    policy: restrictivePolicy,
    wallet: {
      issuerAddress: "0x1234567890abcdef1234567890abcdef12345678",
      chainId: 61999,
      networkName: "Genlayer Studio Network",
      issuedVia: "genlayer-js",
    },
    ...overrides,
  };
}

function buildContractPayload(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    judgments: [
      {
        id: "validator-signal-house",
        validatorName: "Signal House",
        verdict: "Impersonation Risk",
        confidence: 0.94,
        reasoning: "Voice clone closely mimics the creator.",
        citedEvidenceIds: ["ev-imp-source", "ev-imp-output"],
      },
      {
        id: "validator-rights-ledger",
        validatorName: "Rights Ledger",
        verdict: "Impersonation Risk",
        confidence: 0.89,
        reasoning: "Persona protections are clearly violated.",
        citedEvidenceIds: ["ev-imp-output"],
      },
    ],
    finalVerdict: "Impersonation Risk",
    score: 92,
    summary: "Validators flagged identity imitation.",
    recommendedAction: "Escalate with full evidence bundle.",
    supportingEvidenceCount: 2,
    supportingValidatorCount: 2,
    caseId: impersonationCase.id,
    ...overrides,
  });
}

function makeMockClients(payload: string = buildContractPayload()) {
  const writeContract = vi.fn().mockResolvedValue(TEST_TX_HASH);
  const waitForTransactionReceipt = vi
    .fn()
    .mockResolvedValue({ txExecutionResultName: "FINISHED_WITH_RETURN" });
  const readContract = vi.fn().mockResolvedValue(payload);

  const walletClient = { writeContract } as never;
  const readClient = { waitForTransactionReceipt, readContract } as never;
  return { walletClient, readClient, writeContract, waitForTransactionReceipt, readContract };
}

describe("GenLayerTrialEngine guards", () => {
  it("throws NotConfigured when the contract address is missing", async () => {
    const engine = new GenLayerTrialEngine({ contractAddress: null });
    await expect(engine.runTrial(buildInput())).rejects.toBeInstanceOf(
      GenLayerTrialEngineNotConfiguredError,
    );
  });

  it("throws NotConfigured when the wallet client is missing", async () => {
    const engine = new GenLayerTrialEngine({
      contractAddress: TEST_ADDRESS,
      walletClient: null,
    });
    await expect(engine.runTrial(buildInput())).rejects.toBeInstanceOf(
      GenLayerTrialEngineNotConfiguredError,
    );
  });
});

describe("GenLayerTrialEngine.runTrial happy path", () => {
  it("submits run_trial, waits for finalization, and reads the persisted result", async () => {
    const { walletClient, readClient, writeContract, waitForTransactionReceipt, readContract } =
      makeMockClients();

    const engine = new GenLayerTrialEngine({
      contractAddress: TEST_ADDRESS,
      walletClient,
      readClient,
    });

    const result = await engine.runTrial(buildInput());

    expect(writeContract).toHaveBeenCalledWith({
      address: TEST_ADDRESS,
      functionName: "run_trial",
      args: [JSON.stringify(impersonationCase), JSON.stringify(restrictivePolicy)],
    });
    expect(waitForTransactionReceipt).toHaveBeenCalledWith({
      hash: TEST_TX_HASH,
      status: "FINALIZED",
    });
    expect(readContract).toHaveBeenCalledWith({
      address: TEST_ADDRESS,
      functionName: "get_result_by_case",
      args: [impersonationCase.id],
    });

    expect(result.receipt.finalVerdict).toBe("Impersonation Risk");
    expect(result.receipt.score).toBe(92);
    expect(result.receipt.caseId).toBe(impersonationCase.id);
    expect(result.receipt.wallet?.issuerAddress).toBe(
      "0x1234567890abcdef1234567890abcdef12345678",
    );
    expect(result.judgments).toHaveLength(2);
    expect(result.judgments[0].verdict).toBe("Impersonation Risk");
    expect(result.receipt.id).toContain("receipt-case-voice-clone-");
  });
});

describe("GenLayerTrialEngine.runTrial error paths", () => {
  it("wraps writeContract failures as ExecutionError", async () => {
    const { readClient } = makeMockClients();
    const walletClient = {
      writeContract: vi.fn().mockRejectedValue(new Error("user rejected")),
    } as never;

    const engine = new GenLayerTrialEngine({
      contractAddress: TEST_ADDRESS,
      walletClient,
      readClient,
    });

    await expect(engine.runTrial(buildInput())).rejects.toBeInstanceOf(
      GenLayerTrialEngineExecutionError,
    );
  });

  it("rejects when the contract returns an empty payload", async () => {
    const { walletClient, readClient } = makeMockClients("");

    const engine = new GenLayerTrialEngine({
      contractAddress: TEST_ADDRESS,
      walletClient,
      readClient,
    });

    await expect(engine.runTrial(buildInput())).rejects.toBeInstanceOf(
      GenLayerTrialEngineExecutionError,
    );
  });

  it("rejects when the contract returns an unrecognized verdict category", async () => {
    const malformedPayload = buildContractPayload({ finalVerdict: "Maybe" });
    const { walletClient, readClient } = makeMockClients(malformedPayload);

    const engine = new GenLayerTrialEngine({
      contractAddress: TEST_ADDRESS,
      walletClient,
      readClient,
    });

    await expect(engine.runTrial(buildInput())).rejects.toBeInstanceOf(
      GenLayerTrialEngineExecutionError,
    );
  });

  it("rejects when the receipt reports a non-success execution result", async () => {
    const { readClient, walletClient } = makeMockClients();
    const readClientWithFailure = {
      ...readClient,
      waitForTransactionReceipt: vi
        .fn()
        .mockResolvedValue({ txExecutionResultName: "FINISHED_WITH_ERROR" }),
    } as never;

    const engine = new GenLayerTrialEngine({
      contractAddress: TEST_ADDRESS,
      walletClient,
      readClient: readClientWithFailure,
    });

    await expect(engine.runTrial(buildInput())).rejects.toBeInstanceOf(
      GenLayerTrialEngineExecutionError,
    );
  });

  it("throws when writeContract returns undefined", async () => {
    const walletClient = {
      writeContract: vi.fn().mockResolvedValue(undefined),
    } as never;
    const readClient = {
      waitForTransactionReceipt: vi.fn(),
      readContract: vi.fn(),
    } as never;

    const engine = new GenLayerTrialEngine({
      contractAddress: TEST_ADDRESS,
      walletClient,
      readClient,
    });

    await expect(
      engine.runTrial(buildInput({ wallet: undefined })),
    ).rejects.toThrow(/invalid transaction hash/i);
    expect(readClient.waitForTransactionReceipt).not.toHaveBeenCalled();
  });

  it("throws when writeContract returns a non-hex string", async () => {
    const walletClient = {
      writeContract: vi.fn().mockResolvedValue("not-a-hash"),
    } as never;
    const readClient = {
      waitForTransactionReceipt: vi.fn(),
      readContract: vi.fn(),
    } as never;

    const engine = new GenLayerTrialEngine({
      contractAddress: TEST_ADDRESS,
      walletClient,
      readClient,
    });

    await expect(
      engine.runTrial(buildInput({ wallet: undefined })),
    ).rejects.toThrow(/invalid transaction hash/i);
  });
});
