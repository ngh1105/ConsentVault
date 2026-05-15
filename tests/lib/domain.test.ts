import { describe, expect, it } from "vitest";
import type { CaseStatus, VerdictCategory } from "@/lib/domain";

const statuses: CaseStatus[] = ["Draft", "In Review", "Verdict Ready"];
const verdicts: VerdictCategory[] = [
  "Allowed",
  "Needs Attribution",
  "Needs License",
  "Impersonation Risk",
  "Violation",
];

describe("ConsentVault domain unions", () => {
  it("supports the seeded case status values", () => {
    expect(statuses).toEqual(["Draft", "In Review", "Verdict Ready"]);
  });

  it("supports the seeded verdict categories", () => {
    expect(verdicts).toEqual([
      "Allowed",
      "Needs Attribution",
      "Needs License",
      "Impersonation Risk",
      "Violation",
    ]);
  });
});
