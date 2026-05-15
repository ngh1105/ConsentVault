import { describe, expect, it } from "vitest";
import type { ValidatorJudgment } from "@/lib/domain";
import { runMockTrial } from "@/lib/mock-trial-engine";
import {
  restrictivePolicy,
  permissivePolicy,
  impersonationCase,
  attributionCase,
  sampleCases,
  sampleReceipts,
} from "@/lib/sample-data";
import { aggregateVerdict } from "@/lib/verdict";

const allowedCase = sampleCases.find((consentCase) => consentCase.id === "case-allowed-benchmark");

if (!allowedCase) {
  throw new Error("Expected seeded allowed benchmark case");
}

function createJudgment(
  verdict: ValidatorJudgment["verdict"],
  confidence: number,
  id: string,
): ValidatorJudgment {
  return {
    id,
    validatorName: `Validator ${id}`,
    verdict,
    confidence,
    reasoning: `${verdict} with ${confidence} confidence`,
    citedEvidenceIds: allowedCase.evidenceItems.map((item) => item.id),
  };
}

describe("runMockTrial", () => {
  it("returns Impersonation Risk when the policy blocks impersonation and the output imitates identity", async () => {
    const result = await runMockTrial({ case: impersonationCase, policy: restrictivePolicy });

    expect(result.receipt.finalVerdict).toBe("Impersonation Risk");
    expect(result.judgments).toHaveLength(3);
    expect(result.receipt.score).toBeGreaterThan(70);
  });

  it("downgrades to Needs Attribution when the only issue is missing credit", async () => {
    const result = await runMockTrial({ case: attributionCase, policy: permissivePolicy });

    expect(result.receipt.finalVerdict).toBe("Needs Attribution");
  });

  it("keeps a permissive non-commercial benchmark case Allowed even when license rules mention licenses", async () => {
    const result = await runMockTrial({ case: allowedCase, policy: permissivePolicy });

    expect(result.receipt.finalVerdict).toBe("Allowed");
    expect(result.judgments.filter((judgment) => judgment.verdict === "Allowed")).toHaveLength(2);
  });

  it("keeps receipt scores in a 0-100 unit across seeded and generated verdicts", async () => {
    const result = await runMockTrial({ case: impersonationCase, policy: restrictivePolicy });

    expect(sampleReceipts.every((receipt) => receipt.score > 1 && receipt.score <= 100)).toBe(true);
    expect(result.receipt.score).toBeGreaterThanOrEqual(0);
    expect(result.receipt.score).toBeLessThanOrEqual(100);
  });
});

describe("aggregateVerdict", () => {
  it("prefers the verdict with the highest total support before severity", () => {
    const receipt = aggregateVerdict({
      case: allowedCase,
      policy: permissivePolicy,
      judgments: [
        createJudgment("Allowed", 0.55, "allowed-a"),
        createJudgment("Allowed", 0.54, "allowed-b"),
        createJudgment("Violation", 0.95, "violation-a"),
      ],
    });

    expect(receipt.finalVerdict).toBe("Allowed");
    expect(receipt.score).toBe(55);
  });

  it("breaks support ties toward the stricter verdict", () => {
    const receipt = aggregateVerdict({
      case: allowedCase,
      policy: permissivePolicy,
      judgments: [
        createJudgment("Allowed", 0.9, "allowed-a"),
        createJudgment("Needs Attribution", 0.9, "attribution-a"),
      ],
    });

    expect(receipt.finalVerdict).toBe("Needs Attribution");
    expect(receipt.score).toBe(90);
  });
});
