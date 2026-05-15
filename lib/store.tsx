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
} from "react";
import type {
  ConsentCase,
  ConsentPolicy,
  ConsentVaultState,
  VerdictReceipt,
} from "@/lib/domain";
import { sampleCases, samplePolicies, sampleReceipts } from "@/lib/sample-data";
import {
  CONSENT_VAULT_STORAGE_KEY,
  safeParseConsentVaultState,
  safeStringify,
} from "@/lib/storage";

export interface CaseSubmission {
  title: string;
  sourceUrl: string;
  aiOutputUrl: string;
  platformUrl: string;
  notes: string;
  policyId: string;
}

export type ConsentVaultAction =
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

function createInitialStateFromStorage(): ConsentVaultState {
  if (typeof window === "undefined") {
    return createInitialConsentVaultState();
  }

  const stored = window.localStorage.getItem(CONSENT_VAULT_STORAGE_KEY);
  return stored ? deserializeConsentVaultState(stored) : createInitialConsentVaultState();
}

export function consentVaultReducer(
  state: ConsentVaultState,
  action: ConsentVaultAction,
): ConsentVaultState {
  switch (action.type) {
    case "policy/save": {
      return {
        ...state,
        policies: upsertById(state.policies, action.payload),
      };
    }
    case "case/create": {
      const timestamp = new Date().toISOString();
      const createdCase: ConsentCase = {
        id: `case-${Date.now()}`,
        title: action.payload.title,
        status: "Draft",
        policyId: action.payload.policyId,
        sourceUrl: action.payload.sourceUrl,
        aiOutputUrl: action.payload.aiOutputUrl,
        platformUrl: action.payload.platformUrl,
        notes: action.payload.notes,
        originalContent: "",
        aiOutput: "",
        evidenceItems: [],
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
        receipts: upsertById(state.receipts, action.payload),
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
    createInitialStateFromStorage,
  );

  useEffect(() => {
    window.localStorage.setItem(
      CONSENT_VAULT_STORAGE_KEY,
      serializeConsentVaultState(state),
    );
  }, [state]);

  const value = useMemo<ConsentVaultContextValue>(() => {
    const getCaseById = (caseId: string) => state.cases.find((item) => item.id === caseId);
    const getPolicyById = (policyId: string) =>
      state.policies.find((item) => item.id === policyId);
    const getReceiptByCaseId = (caseId: string) =>
      state.receipts.find((item) => item.caseId === caseId);

    return {
      state,
      dispatch,
      policies: state.policies,
      cases: state.cases,
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
