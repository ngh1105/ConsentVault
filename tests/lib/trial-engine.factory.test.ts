import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GenLayerTrialEngine } from "@/lib/genlayer/genlayer-trial-engine";
import { getTrialEngine } from "@/lib/trial-engine.factory";

const ORIGINAL_ADDRESS = process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS;

function restoreEnv(key: string, original: string | undefined) {
  if (original === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = original;
  }
}

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS;
});

afterEach(() => {
  restoreEnv("NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS", ORIGINAL_ADDRESS);
});

describe("getTrialEngine", () => {
  it("returns the GenLayer engine by default", () => {
    const engine = getTrialEngine();
    expect(engine).toBeInstanceOf(GenLayerTrialEngine);
  });

  it("forwards the contract address from env to the GenLayer engine", async () => {
    process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS =
      "0xabcdef0123456789abcdef0123456789abcdef01";
    const engine = getTrialEngine() as GenLayerTrialEngine;

    // Without a wallet client we should hit the wallet-missing guard before
    // anything else. That confirms the contract address was accepted.
    await expect(
      engine.runTrial({
        case: { id: "case", title: "", status: "Draft", policyId: "", sourceUrl: "", aiOutputUrl: "", platformUrl: "", notes: "", originalContent: "", aiOutput: "", evidenceItems: [], createdAt: "" },
        policy: { id: "", creatorName: "", creatorHandle: "", allowedUses: [], blockedUses: [], attributionRules: "", licenseRules: "", jurisdictionNote: "", createdAt: "" },
      }),
    ).rejects.toThrow(/wallet client is not available/i);
  });

  it("surfaces the missing-contract guard when the address is absent", async () => {
    const engine = getTrialEngine() as GenLayerTrialEngine;

    await expect(
      engine.runTrial({
        case: { id: "case", title: "", status: "Draft", policyId: "", sourceUrl: "", aiOutputUrl: "", platformUrl: "", notes: "", originalContent: "", aiOutput: "", evidenceItems: [], createdAt: "" },
        policy: { id: "", creatorName: "", creatorHandle: "", allowedUses: [], blockedUses: [], attributionRules: "", licenseRules: "", jurisdictionNote: "", createdAt: "" },
      }),
    ).rejects.toThrow(/NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS/);
  });
});
