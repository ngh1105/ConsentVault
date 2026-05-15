export type CaseStatus = "Draft" | "In Review" | "Verdict Ready";
export type VerdictCategory =
  | "Allowed"
  | "Needs Attribution"
  | "Needs License"
  | "Impersonation Risk"
  | "Violation";

export interface ConsentPolicy {
  id: string;
  creatorName: string;
  creatorHandle: string;
  allowedUses: string[];
  blockedUses: string[];
  attributionRules: string;
  licenseRules: string;
  jurisdictionNote: string;
  createdAt: string;
}

export interface EvidenceItem {
  id: string;
  type: "source" | "output" | "platform" | "note" | "policy";
  title: string;
  url: string;
  description: string;
  capturedAt: string;
}

export interface ConsentCase {
  id: string;
  title: string;
  status: CaseStatus;
  policyId: string;
  sourceUrl: string;
  aiOutputUrl: string;
  platformUrl: string;
  notes: string;
  originalContent: string;
  aiOutput: string;
  evidenceItems: EvidenceItem[];
  createdAt: string;
}

export interface ValidatorJudgment {
  id: string;
  validatorName: string;
  verdict: VerdictCategory;
  confidence: number;
  reasoning: string;
  citedEvidenceIds: string[];
}

export interface VerdictReceipt {
  id: string;
  caseId: string;
  finalVerdict: VerdictCategory;
  score: number;
  summary: string;
  recommendedAction: string;
  judgments: ValidatorJudgment[];
  createdAt: string;
}

export interface ConsentVaultState {
  policies: ConsentPolicy[];
  cases: ConsentCase[];
  receipts: VerdictReceipt[];
  activeCaseId: string;
}
