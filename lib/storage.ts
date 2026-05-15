import type {
  ConsentCase,
  ConsentPolicy,
  ConsentVaultState,
  EvidenceItem,
  ValidatorJudgment,
  VerdictReceipt,
} from "@/lib/domain";

export const CONSENT_VAULT_STORAGE_KEY = "consentvault.state";

const CASE_STATUSES = new Set<ConsentCase["status"]>([
  "Draft",
  "In Review",
  "Verdict Ready",
]);
const VERDICT_CATEGORIES = new Set<ValidatorJudgment["verdict"]>([
  "Allowed",
  "Needs Attribution",
  "Needs License",
  "Impersonation Risk",
  "Violation",
]);
const EVIDENCE_TYPES = new Set<EvidenceItem["type"]>([
  "source",
  "output",
  "platform",
  "note",
  "policy",
]);

export function safeStringify(value: ConsentVaultState): string {
  return JSON.stringify(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPercentageScore(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0 && value <= 100;
}

function isConsentPolicy(value: unknown): value is ConsentPolicy {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.creatorName === "string" &&
    typeof value.creatorHandle === "string" &&
    isStringArray(value.allowedUses) &&
    isStringArray(value.blockedUses) &&
    typeof value.attributionRules === "string" &&
    typeof value.licenseRules === "string" &&
    typeof value.jurisdictionNote === "string" &&
    typeof value.createdAt === "string"
  );
}

function isEvidenceItem(value: unknown): value is EvidenceItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.type === "string" &&
    EVIDENCE_TYPES.has(value.type as EvidenceItem["type"]) &&
    typeof value.title === "string" &&
    typeof value.url === "string" &&
    typeof value.description === "string" &&
    typeof value.capturedAt === "string"
  );
}

function isConsentCase(value: unknown): value is ConsentCase {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.status === "string" &&
    CASE_STATUSES.has(value.status as ConsentCase["status"]) &&
    typeof value.policyId === "string" &&
    typeof value.sourceUrl === "string" &&
    typeof value.aiOutputUrl === "string" &&
    typeof value.platformUrl === "string" &&
    typeof value.notes === "string" &&
    typeof value.originalContent === "string" &&
    typeof value.aiOutput === "string" &&
    Array.isArray(value.evidenceItems) &&
    value.evidenceItems.every(isEvidenceItem) &&
    typeof value.createdAt === "string"
  );
}

function isValidatorJudgment(value: unknown): value is ValidatorJudgment {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.validatorName === "string" &&
    typeof value.verdict === "string" &&
    VERDICT_CATEGORIES.has(value.verdict as ValidatorJudgment["verdict"]) &&
    isFiniteNumber(value.confidence) &&
    typeof value.reasoning === "string" &&
    isStringArray(value.citedEvidenceIds)
  );
}

function isVerdictReceipt(value: unknown): value is VerdictReceipt {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.caseId === "string" &&
    typeof value.finalVerdict === "string" &&
    VERDICT_CATEGORIES.has(value.finalVerdict as VerdictReceipt["finalVerdict"]) &&
    isPercentageScore(value.score) &&
    typeof value.summary === "string" &&
    typeof value.recommendedAction === "string" &&
    Array.isArray(value.judgments) &&
    value.judgments.every(isValidatorJudgment) &&
    typeof value.createdAt === "string"
  );
}

function isConsentVaultState(value: unknown): value is ConsentVaultState {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Array.isArray(value.policies) &&
    value.policies.every(isConsentPolicy) &&
    Array.isArray(value.cases) &&
    value.cases.every(isConsentCase) &&
    Array.isArray(value.receipts) &&
    value.receipts.every(isVerdictReceipt) &&
    typeof value.activeCaseId === "string"
  );
}

export function safeParseConsentVaultState(value: string): ConsentVaultState | null {
  try {
    const parsed = JSON.parse(value) as unknown;
    return isConsentVaultState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function safeReadStorage(key: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeWriteStorage(key: string, value: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable or write-protected; ignore persistence failures.
  }
}
