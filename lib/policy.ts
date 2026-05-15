import type { ConsentPolicy } from "@/lib/domain";

export type PolicyDraft = {
  creatorName: string;
  creatorHandle: string;
  allowedUses: string | string[];
  blockedUses: string | string[];
  attributionRules: string;
  licenseRules: string;
  jurisdictionNote: string;
};

function normalizePolicyClauses(input: string | string[]) {
  const values = Array.isArray(input) ? input : input.split(",");
  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const clause = value.trim();

    if (!clause) {
      continue;
    }

    const dedupeKey = clause.toLocaleLowerCase();
    if (seen.has(dedupeKey)) {
      continue;
    }

    seen.add(dedupeKey);
    normalized.push(clause);
  }

  return normalized;
}

export function normalizeBlockedUses(input: string | string[]) {
  return normalizePolicyClauses(input);
}

export function savePolicyDraft(policy: ConsentPolicy, draft: PolicyDraft): ConsentPolicy {
  return {
    ...policy,
    creatorName: draft.creatorName.trim(),
    creatorHandle: draft.creatorHandle.trim(),
    allowedUses: normalizePolicyClauses(draft.allowedUses),
    blockedUses: normalizeBlockedUses(draft.blockedUses),
    attributionRules: draft.attributionRules.trim(),
    licenseRules: draft.licenseRules.trim(),
    jurisdictionNote: draft.jurisdictionNote.trim(),
  };
}
