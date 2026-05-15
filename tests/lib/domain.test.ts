import { describe, expect, it } from "vitest";
import { sampleCases, sampleJudgments, samplePolicies, sampleReceipts } from "@/lib/sample-data";

describe("ConsentVault sample data invariants", () => {
  it("ensures every case references an existing policy", () => {
    const policyIds = new Set(samplePolicies.map((policy) => policy.id));

    expect(sampleCases.every((consentCase) => policyIds.has(consentCase.policyId))).toBe(true);
  });

  it("ensures every receipt references an existing case", () => {
    const caseIds = new Set(sampleCases.map((consentCase) => consentCase.id));

    expect(sampleReceipts.every((receipt) => caseIds.has(receipt.caseId))).toBe(true);
  });

  it("ensures every cited evidence id exists on its associated case", () => {
    const casesById = new Map(sampleCases.map((consentCase) => [consentCase.id, consentCase]));

    expect(
      sampleReceipts.every((receipt) => {
        const consentCase = casesById.get(receipt.caseId);

        if (!consentCase) {
          return false;
        }

        const evidenceIds = new Set(consentCase.evidenceItems.map((item) => item.id));

        return receipt.judgments.every((judgment) =>
          judgment.citedEvidenceIds.every((evidenceId) => evidenceIds.has(evidenceId)),
        );
      }),
    ).toBe(true);
  });

  it("uses every seeded case status and verdict category in the fixture data", () => {
    const usedStatuses = new Set(sampleCases.map((consentCase) => consentCase.status));
    const usedVerdicts = new Set([
      ...sampleReceipts.map((receipt) => receipt.finalVerdict),
      ...sampleJudgments.map((judgment) => judgment.verdict),
    ]);

    expect(usedStatuses).toEqual(new Set(["Draft", "In Review", "Verdict Ready"]));
    expect(usedVerdicts).toEqual(
      new Set([
        "Allowed",
        "Needs Attribution",
        "Needs License",
        "Impersonation Risk",
        "Violation",
      ]),
    );
  });
});
