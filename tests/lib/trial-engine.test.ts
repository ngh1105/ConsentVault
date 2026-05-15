import { describe, expect, it } from "vitest";
import { runMockTrial } from "@/lib/mock-trial-engine";
import {
  restrictivePolicy,
  permissivePolicy,
  impersonationCase,
  attributionCase,
} from "@/lib/sample-data";

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
});
