import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GenLayerTrialEngine } from "@/lib/genlayer/genlayer-trial-engine";
import { getTrialEngine, resolveTrialEngineKind } from "@/lib/trial-engine.factory";

const ORIGINAL_ENGINE = process.env.NEXT_PUBLIC_TRIAL_ENGINE;
const ORIGINAL_ADDRESS = process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS;

function restoreEnv(key: string, original: string | undefined) {
  if (original === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = original;
  }
}

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_TRIAL_ENGINE;
  delete process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS;
});

afterEach(() => {
  restoreEnv("NEXT_PUBLIC_TRIAL_ENGINE", ORIGINAL_ENGINE);
  restoreEnv("NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS", ORIGINAL_ADDRESS);
});

describe("resolveTrialEngineKind", () => {
  it("falls back to mock when the env var is unset", () => {
    expect(resolveTrialEngineKind(undefined)).toBe("mock");
  });

  it("falls back to mock when the env var is empty or unrecognized", () => {
    expect(resolveTrialEngineKind("")).toBe("mock");
    expect(resolveTrialEngineKind("real")).toBe("mock");
  });

  it("recognizes genlayer regardless of casing", () => {
    expect(resolveTrialEngineKind("genlayer")).toBe("genlayer");
    expect(resolveTrialEngineKind("GenLayer")).toBe("genlayer");
    expect(resolveTrialEngineKind("  GENLAYER  ")).toBe("genlayer");
  });
});

describe("getTrialEngine", () => {
  it("returns a mock engine by default", async () => {
    const engine = getTrialEngine();
    expect(engine).not.toBeInstanceOf(GenLayerTrialEngine);
    // The mock engine resolves the trial deterministically without external calls.
    expect(typeof engine.runTrial).toBe("function");
  });

  it("returns a GenLayer engine when the flag is set", () => {
    process.env.NEXT_PUBLIC_TRIAL_ENGINE = "genlayer";
    const engine = getTrialEngine();
    expect(engine).toBeInstanceOf(GenLayerTrialEngine);
  });

  it("forwards the contract address from env to the GenLayer engine", async () => {
    process.env.NEXT_PUBLIC_TRIAL_ENGINE = "genlayer";
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
    process.env.NEXT_PUBLIC_TRIAL_ENGINE = "genlayer";
    const engine = getTrialEngine() as GenLayerTrialEngine;

    await expect(
      engine.runTrial({
        case: { id: "case", title: "", status: "Draft", policyId: "", sourceUrl: "", aiOutputUrl: "", platformUrl: "", notes: "", originalContent: "", aiOutput: "", evidenceItems: [], createdAt: "" },
        policy: { id: "", creatorName: "", creatorHandle: "", allowedUses: [], blockedUses: [], attributionRules: "", licenseRules: "", jurisdictionNote: "", createdAt: "" },
      }),
    ).rejects.toThrow(/NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS/);
  });
});
