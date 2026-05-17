"use client";

import * as React from "react";
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import type {
  CaseStatus,
  ConsentCase,
  ConsentPolicy,
  ConsentVaultState,
  EvidenceItem,
  VerdictReceipt,
} from "@/lib/domain";
import { sampleCases, samplePolicies, sampleReceipts } from "@/lib/sample-data";
import {
  CONSENT_VAULT_STORAGE_KEY,
  safeParseConsentVaultState,
  safeReadStorage,
  safeStringify,
  safeWriteStorage,
} from "@/lib/storage";

export interface CaseSubmission {
  id?: string;
  createdAt?: string;
  title: string;
  sourceUrl: string;
  aiOutputUrl: string;
  platformUrl: string;
  notes: string;
  policyId: string;
  evidenceItems?: EvidenceItem[];
}

export type ConsentVaultAction =
  | { type: "storage/hydrate"; payload: ConsentVaultState }
  | { type: "policy/save"; payload: ConsentPolicy }
  | { type: "case/create"; payload: CaseSubmission }
  | { type: "case/update"; payload: ConsentCase }
  | { type: "receipt/save"; payload: VerdictReceipt }
  | { type: "activeCase/set"; payload: string };

interface ConsentVaultContextValue {
  state: ConsentVaultState;
  dispatch: Dispatch<ConsentVaultAction>;
  policies: ConsentPolicy[];
  cases: ConsentCase[];
  receipts: VerdictReceipt[];
  activeCase: ConsentCase | undefined;
  getCaseById: (caseId: string) => ConsentCase | undefined;
  getPolicyById: (policyId: string) => ConsentPolicy | undefined;
  getReceiptByCaseId: (caseId: string) => VerdictReceipt | undefined;
}

const ConsentVaultContext = createContext<ConsentVaultContextValue | undefined>(undefined);

function cloneState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function upsertById<T extends { id: string }>(items: T[], item: T): T[] {
  const existingIndex = items.findIndex((entry) => entry.id === item.id);

  if (existingIndex === -1) {
    return [item, ...items];
  }

  return items.map((entry) => (entry.id === item.id ? item : entry));
}

function upsertReceiptByCaseId(items: VerdictReceipt[], item: VerdictReceipt): VerdictReceipt[] {
  const existingIndex = items.findIndex((entry) => entry.caseId === item.caseId);

  if (existingIndex === -1) {
    return [item, ...items];
  }

  return items.map((entry) => (entry.caseId === item.caseId ? item : entry));
}

function summarizeEvidenceItems(evidenceItems: EvidenceItem[]): {
  originalContent: string;
  aiOutput: string;
} {
  const sourceItem = evidenceItems.find((item) => item.type === "source");
  const outputItem = evidenceItems.find((item) => item.type === "output");

  return {
    originalContent: sourceItem?.description ?? sourceItem?.title ?? "",
    aiOutput: outputItem?.description ?? outputItem?.title ?? "",
  };
}

export function getEffectiveCaseStatus(
  consentCase: ConsentCase,
  receipts: VerdictReceipt[],
): CaseStatus {
  return receipts.some((receipt) => receipt.caseId === consentCase.id)
    ? "Verdict Ready"
    : consentCase.status;
}

export function withEffectiveCaseStatus(
  consentCase: ConsentCase,
  receipts: VerdictReceipt[],
): ConsentCase {
  const status = getEffectiveCaseStatus(consentCase, receipts);

  return status === consentCase.status ? consentCase : { ...consentCase, status };
}

export function createInitialConsentVaultState(): ConsentVaultState {
  return {
    policies: cloneState(samplePolicies),
    cases: cloneState(sampleCases),
    receipts: cloneState(sampleReceipts),
    activeCaseId: sampleCases[0]?.id ?? "",
  };
}

export function serializeConsentVaultState(state: ConsentVaultState): string {
  return safeStringify(state);
}

export function deserializeConsentVaultState(value: string): ConsentVaultState {
  return safeParseConsentVaultState(value) ?? createInitialConsentVaultState();
}

export function consentVaultReducer(
  state: ConsentVaultState,
  action: ConsentVaultAction,
): ConsentVaultState {
  switch (action.type) {
    case "storage/hydrate": {
      return action.payload;
    }
    case "policy/save": {
      return {
        ...state,
        policies: upsertById(state.policies, action.payload),
      };
    }
    case "case/create": {
      const timestamp = action.payload.createdAt ?? new Date().toISOString();
      const evidenceItems = action.payload.evidenceItems ?? [];
      const { originalContent, aiOutput } = summarizeEvidenceItems(evidenceItems);
      const createdCase: ConsentCase = {
        id: action.payload.id ?? `case-${Date.now()}`,
        title: action.payload.title.trim(),
        status: "Draft",
        policyId: action.payload.policyId,
        sourceUrl: action.payload.sourceUrl.trim(),
        aiOutputUrl: action.payload.aiOutputUrl.trim(),
        platformUrl: action.payload.platformUrl.trim(),
        notes: action.payload.notes.trim(),
        originalContent,
        aiOutput,
        evidenceItems,
        createdAt: timestamp,
      };

      return {
        ...state,
        cases: [createdCase, ...state.cases],
        activeCaseId: createdCase.id,
      };
    }
    case "case/update": {
      return {
        ...state,
        cases: upsertById(state.cases, action.payload),
      };
    }
    case "receipt/save": {
      return {
        ...state,
        receipts: upsertReceiptByCaseId(state.receipts, action.payload),
        cases: state.cases.map((item) =>
          item.id === action.payload.caseId
            ? {
                ...item,
                status: "Verdict Ready",
              }
            : item,
        ),
      };
    }
    case "activeCase/set": {
      return {
        ...state,
        activeCaseId: action.payload,
      };
    }
    default: {
      return state;
    }
  }
}

export function ConsentVaultProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(
    consentVaultReducer,
    undefined,
    createInitialConsentVaultState,
  );
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = safeReadStorage(CONSENT_VAULT_STORAGE_KEY);

    if (stored) {
      dispatch({ type: "storage/hydrate", payload: deserializeConsentVaultState(stored) });
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    safeWriteStorage(CONSENT_VAULT_STORAGE_KEY, serializeConsentVaultState(state));
  }, [isHydrated, state]);

  const value = useMemo<ConsentVaultContextValue>(() => {
    const cases = state.cases.map((item) => withEffectiveCaseStatus(item, state.receipts));
    const getCaseById = (caseId: string) => cases.find((item) => item.id === caseId);
    const getPolicyById = (policyId: string) =>
      state.policies.find((item) => item.id === policyId);
    const getReceiptByCaseId = (caseId: string) =>
      state.receipts.find((item) => item.caseId === caseId);

    return {
      state,
      dispatch,
      policies: state.policies,
      cases,
      receipts: state.receipts,
      activeCase: getCaseById(state.activeCaseId),
      getCaseById,
      getPolicyById,
      getReceiptByCaseId,
    };
  }, [state]);

  return <ConsentVaultContext.Provider value={value}>{children}</ConsentVaultContext.Provider>;
}

export function useConsentVault() {
  const context = useContext(ConsentVaultContext);

  if (!context) {
    throw new Error("useConsentVault must be used within a ConsentVaultProvider");
  }

  return context;
}
