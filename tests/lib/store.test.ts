import * as React from "react";
import { renderToString } from "react-dom/server";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sampleCases, samplePolicies, sampleReceipts } from "@/lib/sample-data";
import { CONSENT_VAULT_STORAGE_KEY } from "@/lib/storage";
import {
  ConsentVaultProvider,
  consentVaultReducer,
  createInitialConsentVaultState,
  deserializeConsentVaultState,
  getEffectiveCaseStatus,
  serializeConsentVaultState,
  useConsentVault,
  withEffectiveCaseStatus,
} from "@/lib/store";

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
  window.localStorage.clear();
});

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

  it("keeps a provided case id, evidence bundle, and timestamp when creating a case", () => {
    const state = createInitialConsentVaultState();
    const next = consentVaultReducer(state, {
      type: "case/create",
      payload: {
        id: "case-voice-clone-dispute",
        createdAt: "2026-05-15T12:00:00.000Z",
        title: "Voice clone dispute",
        sourceUrl: "https://creator.example/source",
        aiOutputUrl: "https://platform.example/output",
        platformUrl: "https://platform.example/post",
        notes: "Suspicious synthetic voice reuse",
        policyId: sampleCases[0].policyId,
        evidenceItems: [
          {
            id: "voice-clone-dispute-source",
            type: "source",
            title: "Voice clone dispute source record",
            url: "https://creator.example/source",
            description: "Original creator source gathered for Voice clone dispute. Suspicious synthetic voice reuse",
            capturedAt: "voice-clone-dispute-source-captured",
          },
        ],
      },
    });

    expect(next.cases[0]).toMatchObject({
      id: "case-voice-clone-dispute",
      createdAt: "2026-05-15T12:00:00.000Z",
      originalContent:
        "Original creator source gathered for Voice clone dispute. Suspicious synthetic voice reuse",
      aiOutput: "",
      evidenceItems: [
        {
          id: "voice-clone-dispute-source",
          type: "source",
        },
      ],
    });
    expect(next.activeCaseId).toBe("case-voice-clone-dispute");
  });

  it("hydrates new intake cases with comparison text from source and output evidence", () => {
    const state = createInitialConsentVaultState();
    const next = consentVaultReducer(state, {
      type: "case/create",
      payload: {
        id: "case-comparison-ready",
        title: "Comparison ready dispute",
        sourceUrl: "https://creator.example/source",
        aiOutputUrl: "https://platform.example/output",
        platformUrl: "https://platform.example/post",
        notes: "Synthetic reuse appears close to the original",
        policyId: sampleCases[0].policyId,
        evidenceItems: [
          {
            id: "comparison-source",
            type: "source",
            title: "Comparison source",
            url: "https://creator.example/source",
            description: "Original creator source gathered for comparison.",
            capturedAt: "2026-05-15T12:00:00.000Z",
          },
          {
            id: "comparison-output",
            type: "output",
            title: "Comparison output",
            url: "https://platform.example/output",
            description: "AI-generated output gathered for comparison.",
            capturedAt: "2026-05-15T12:01:00.000Z",
          },
        ],
      },
    });

    expect(next.cases[0]).toMatchObject({
      originalContent: "Original creator source gathered for comparison.",
      aiOutput: "AI-generated output gathered for comparison.",
    });
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

    expect(next.receipts.find((receipt) => receipt.caseId === state.cases[1].id)?.id).toBe(
      "receipt-updated",
    );
    expect(next.cases.find((item) => item.id === state.cases[1].id)?.status).toBe(
      "Verdict Ready",
    );
  });

  it("derives verdict-ready status for cases that already have a receipt", () => {
    const state = createInitialConsentVaultState();
    const receiptBackedCase = {
      ...state.cases[1],
      status: "Draft" as const,
    };
    const receipt = {
      ...sampleReceipts[0],
      caseId: receiptBackedCase.id,
    };

    expect(getEffectiveCaseStatus(receiptBackedCase, [receipt])).toBe("Verdict Ready");
    expect(withEffectiveCaseStatus(receiptBackedCase, [receipt])).toMatchObject({
      id: receiptBackedCase.id,
      status: "Verdict Ready",
    });
  });

  it("replaces the prior receipt for a case instead of appending a duplicate rerun", () => {
    const state = createInitialConsentVaultState();
    const priorReceipt = state.receipts.find((receipt) => receipt.caseId === sampleCases[0].id);

    if (!priorReceipt) {
      throw new Error("Expected seeded receipt for first sample case");
    }

    const rerunReceipt = {
      ...priorReceipt,
      id: "receipt-rerun-version",
      score: 64,
      summary: "Updated rerun summary",
    };

    const next = consentVaultReducer(state, {
      type: "receipt/save",
      payload: rerunReceipt,
    });

    expect(next.receipts.filter((receipt) => receipt.caseId === priorReceipt.caseId)).toHaveLength(1);
    expect(next.receipts.find((receipt) => receipt.caseId === priorReceipt.caseId)).toMatchObject({
      id: "receipt-rerun-version",
      score: 64,
      summary: "Updated rerun summary",
    });
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

  it("falls back to seed state when persisted payload is a primitive", () => {
    expect(deserializeConsentVaultState("42")).toEqual(createInitialConsentVaultState());
  });

  it("falls back to seed state when persisted payload omits required arrays", () => {
    expect(deserializeConsentVaultState("{}")).toEqual(createInitialConsentVaultState());
  });

  it("falls back to seed state when persisted payload has invalid nested shapes", () => {
    expect(
      deserializeConsentVaultState(
        JSON.stringify({
          policies: samplePolicies,
          cases: null,
          receipts: sampleReceipts,
          activeCaseId: sampleCases[0].id,
        }),
      ),
    ).toEqual(createInitialConsentVaultState());
  });
});

function ConsentVaultProbe() {
  const { state } = useConsentVault();

  return React.createElement(
    React.Fragment,
    null,
    React.createElement("div", { "data-testid": "active-case-id" }, state.activeCaseId),
    React.createElement("div", { "data-testid": "policy-count" }, String(state.policies.length)),
    React.createElement("div", { "data-testid": "case-count" }, String(state.cases.length)),
    React.createElement("div", { "data-testid": "receipt-count" }, String(state.receipts.length)),
    React.createElement("div", { "data-testid": "first-case-title" }, state.cases[0]?.title ?? ""),
    React.createElement("div", { "data-testid": "first-receipt-score" }, String(state.receipts[0]?.score ?? "")),
  );
}

describe("ConsentVaultProvider persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders seed state on the first pass even when browser storage has a different receipt", () => {
    const persisted = createInitialConsentVaultState();
    persisted.receipts[0] = {
      ...persisted.receipts[0],
      score: 92,
    };

    window.localStorage.setItem(
      CONSENT_VAULT_STORAGE_KEY,
      serializeConsentVaultState(persisted),
    );

    const html = renderToString(
      React.createElement(
        ConsentVaultProvider,
        null,
        React.createElement(ConsentVaultProbe),
      ),
    );

    expect(html).toContain(`data-testid="first-receipt-score">${sampleReceipts[0].score}`);
    expect(html).not.toContain(`data-testid="first-receipt-score">92`);
  });

  it("falls back safely when localStorage contains an invalid payload", async () => {
    window.localStorage.setItem(CONSENT_VAULT_STORAGE_KEY, "42");

    render(
      React.createElement(
        ConsentVaultProvider,
        null,
        React.createElement(ConsentVaultProbe),
      ),
    );

    await waitFor(() => {
      expect(screen.getByTestId("policy-count")).toHaveTextContent(
        String(samplePolicies.length),
      );
      expect(screen.getByTestId("case-count")).toHaveTextContent(String(sampleCases.length));
      expect(screen.getByTestId("receipt-count")).toHaveTextContent(
        String(sampleReceipts.length),
      );
      expect(screen.getByTestId("active-case-id")).toHaveTextContent(sampleCases[0].id);
    });
  });

  it("falls back to seed state when localStorage.getItem throws", async () => {
    const getItemSpy = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("storage disabled");
      });

    render(
      React.createElement(
        ConsentVaultProvider,
        null,
        React.createElement(ConsentVaultProbe),
      ),
    );

    await waitFor(() => {
      expect(screen.getByTestId("policy-count")).toHaveTextContent(
        String(samplePolicies.length),
      );
      expect(screen.getByTestId("case-count")).toHaveTextContent(String(sampleCases.length));
      expect(screen.getByTestId("receipt-count")).toHaveTextContent(
        String(sampleReceipts.length),
      );
      expect(screen.getByTestId("active-case-id")).toHaveTextContent(sampleCases[0].id);
      expect(screen.getByTestId("first-case-title")).toHaveTextContent(sampleCases[0].title);
    });

    expect(getItemSpy).toHaveBeenCalledWith(CONSENT_VAULT_STORAGE_KEY);
    getItemSpy.mockRestore();
  });

  it("does not crash when localStorage.setItem throws during persistence", async () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota exceeded");
      });

    expect(() => {
      render(
        React.createElement(
          ConsentVaultProvider,
          null,
          React.createElement(ConsentVaultProbe),
        ),
      );
    }).not.toThrow();

    await waitFor(() => {
      expect(screen.getByTestId("policy-count")).toHaveTextContent(
        String(samplePolicies.length),
      );
      expect(screen.getByTestId("case-count")).toHaveTextContent(String(sampleCases.length));
      expect(screen.getByTestId("receipt-count")).toHaveTextContent(
        String(sampleReceipts.length),
      );
      expect(screen.getByTestId("active-case-id")).toHaveTextContent(sampleCases[0].id);
    });

    expect(setItemSpy).toHaveBeenCalledWith(
      CONSENT_VAULT_STORAGE_KEY,
      serializeConsentVaultState(createInitialConsentVaultState()),
    );
    setItemSpy.mockRestore();
  });

  it("hydrates valid persisted state into context", async () => {
    const persisted = {
      policies: [
        {
          ...samplePolicies[0],
          id: "policy-persisted",
          creatorName: "Persisted Creator",
        },
      ],
      cases: [
        {
          ...sampleCases[0],
          id: "case-persisted",
          policyId: "policy-persisted",
          title: "Persisted case title",
          evidenceItems: [{ ...sampleCases[0].evidenceItems[0], id: "ev-persisted" }],
        },
      ],
      receipts: [
        {
          ...sampleReceipts[0],
          id: "receipt-persisted",
          caseId: "case-persisted",
          judgments: [
            {
              ...sampleReceipts[0].judgments[0],
              id: "judgment-persisted",
              citedEvidenceIds: ["ev-persisted"],
            },
          ],
        },
      ],
      activeCaseId: "case-persisted",
    };

    window.localStorage.setItem(
      CONSENT_VAULT_STORAGE_KEY,
      JSON.stringify(persisted),
    );

    render(
      React.createElement(
        ConsentVaultProvider,
        null,
        React.createElement(ConsentVaultProbe),
      ),
    );

    await waitFor(() => {
      expect(screen.getByTestId("policy-count")).toHaveTextContent("1");
      expect(screen.getByTestId("case-count")).toHaveTextContent("1");
      expect(screen.getByTestId("receipt-count")).toHaveTextContent("1");
      expect(screen.getByTestId("active-case-id")).toHaveTextContent("case-persisted");
      expect(screen.getByTestId("first-case-title")).toHaveTextContent("Persisted case title");
    });
  });

  it("does not overwrite persisted state with seed data on mount", async () => {
    const persisted = {
      policies: [
        {
          ...samplePolicies[0],
          id: "policy-persisted-only",
        },
      ],
      cases: [
        {
          ...sampleCases[0],
          id: "case-persisted-only",
          policyId: "policy-persisted-only",
          title: "Persisted only case",
          evidenceItems: [{ ...sampleCases[0].evidenceItems[0], id: "ev-persisted-only" }],
        },
      ],
      receipts: [
        {
          ...sampleReceipts[0],
          id: "receipt-persisted-only",
          caseId: "case-persisted-only",
          judgments: [
            {
              ...sampleReceipts[0].judgments[0],
              id: "judgment-persisted-only",
              citedEvidenceIds: ["ev-persisted-only"],
            },
          ],
        },
      ],
      activeCaseId: "case-persisted-only",
    };

    window.localStorage.setItem(
      CONSENT_VAULT_STORAGE_KEY,
      JSON.stringify(persisted),
    );

    render(
      React.createElement(
        ConsentVaultProvider,
        null,
        React.createElement(ConsentVaultProbe),
      ),
    );

    expect(
      JSON.parse(window.localStorage.getItem(CONSENT_VAULT_STORAGE_KEY) ?? "null"),
    ).toEqual(persisted);

    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem(CONSENT_VAULT_STORAGE_KEY) ?? "null")).toEqual(
        persisted,
      );
      expect(screen.getByTestId("first-case-title")).toHaveTextContent("Persisted only case");
    });
  });
});
