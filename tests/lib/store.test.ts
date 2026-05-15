import { describe, expect, it } from "vitest";
import {
  consentVaultReducer,
  createInitialConsentVaultState,
  deserializeConsentVaultState,
  serializeConsentVaultState,
} from "@/lib/store";
import { sampleCases, sampleReceipts } from "@/lib/sample-data";

describe("consentVaultReducer", () => {
  it("creates a draft case from an intake submission", () => {
    const state = createInitialConsentVaultState();
    const next = consentVaultReducer(state, {
      type: "case/create",
      payload: {
        title: "Voice clone dispute",
        sourceUrl: "https://creator.example/source",
        aiOutputUrl: "https://platform.example/output",
        platformUrl: "https://platform.example/post",
        notes: "Suspicious synthetic voice reuse",
        policyId: sampleCases[0].policyId,
      },
    });

    expect(next.cases[0].status).toBe("Draft");
    expect(next.activeCaseId).toBe(next.cases[0].id);
  });

  it("marks the matching case verdict ready when saving a receipt", () => {
    const state = createInitialConsentVaultState();
    const next = consentVaultReducer(state, {
      type: "receipt/save",
      payload: {
        ...sampleReceipts[0],
        id: "receipt-updated",
        caseId: state.cases[1].id,
      },
    });

    expect(next.receipts[0].id).toBe("receipt-updated");
    expect(next.cases.find((item) => item.id === state.cases[1].id)?.status).toBe(
      "Verdict Ready",
    );
  });

  it("returns fresh seed copies for each initial state", () => {
    const first = createInitialConsentVaultState();
    const second = createInitialConsentVaultState();

    first.cases[0].title = "Mutated title";

    expect(second.cases[0].title).not.toBe("Mutated title");
  });

  it("round-trips through JSON persistence", () => {
    const state = createInitialConsentVaultState();
    expect(deserializeConsentVaultState(serializeConsentVaultState(state))).toEqual(state);
  });
});
