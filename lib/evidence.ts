import type { ConsentCase, ConsentPolicy } from "@/lib/domain";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "by",
  "for",
  "from",
  "in",
  "of",
  "on",
  "or",
  "that",
  "the",
  "to",
  "with",
  "without",
]);

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueTokens(value: string): string[] {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function collectCaseText(consentCase: ConsentCase): string {
  return normalizeText(
    [
      consentCase.title,
      consentCase.notes,
      consentCase.originalContent,
      consentCase.aiOutput,
      ...consentCase.evidenceItems.flatMap((item) => [item.title, item.description]),
    ].join(" "),
  );
}

function containsPhrase(haystack: string, needle: string): boolean {
  const normalizedNeedle = normalizeText(needle);
  return normalizedNeedle ? haystack.includes(normalizedNeedle) : false;
}

function containsAllTokens(haystack: string, tokens: string[]): boolean {
  return tokens.length > 0 && tokens.every((token) => haystack.includes(token));
}

function containsAnyToken(haystack: string, tokens: string[]): boolean {
  return tokens.some((token) => haystack.includes(token));
}

export function summarizeBlockedClause(clause: string): string {
  const normalizedClause = normalizeText(clause);

  if (
    normalizedClause.includes("voice clon") ||
    normalizedClause.includes("imitate") ||
    normalizedClause.includes("likeness") ||
    normalizedClause.includes("synthetic avatar")
  ) {
    return "impersonation";
  }

  if (normalizedClause.includes("dataset resale")) {
    return "commercial dataset resale";
  }

  if (normalizedClause.includes("attribution")) {
    return "removing attribution";
  }

  if (normalizedClause.includes("subscriber only") || normalizedClause.includes("private subscriber")) {
    return "private subscriber-only releases";
  }

  if (normalizedClause.includes("exclusive sublicens")) {
    return "exclusive sublicensing without approval";
  }

  return normalizedClause;
}

function clauseMatchesCase(consentCase: ConsentCase, clause: string): boolean {
  const caseText = collectCaseText(consentCase);
  const normalizedClause = normalizeText(clause);
  const summary = summarizeBlockedClause(clause);

  if (containsPhrase(caseText, normalizedClause) || containsPhrase(caseText, summary)) {
    return true;
  }

  if (summary === "impersonation") {
    const impersonationSignals = [
      "impersonation",
      "impersonat",
      "mimic",
      "imitat",
      "voice clone",
      "voice cloning",
      "sounds like",
      "likeness",
      "synthetic avatar",
    ];

    if (containsAnyToken(caseText, impersonationSignals)) {
      return true;
    }

    return caseText.includes("voice") && containsAnyToken(caseText, ["endorsement", "mimic", "imitat"]);
  }

  const summaryTokens = uniqueTokens(summary);
  if (summaryTokens.length > 1 && containsAllTokens(caseText, summaryTokens)) {
    return true;
  }

  const clauseTokens = uniqueTokens(normalizedClause);
  if (clauseTokens.length > 1 && containsAllTokens(caseText, clauseTokens)) {
    return true;
  }

  return false;
}

export function isBlockedClauseMatched(clause: string, matchedClauses: string[]): boolean {
  const normalizedClause = normalizeText(clause);
  const normalizedSummary = summarizeBlockedClause(clause);

  return matchedClauses.some((item) => {
    const normalizedMatch = normalizeText(item);
    return normalizedMatch === normalizedClause || summarizeBlockedClause(item) === normalizedSummary;
  });
}

export function matchPolicyClauses(consentCase: ConsentCase, policy: ConsentPolicy): string[] {
  const matches = new Set<string>();

  for (const clause of policy.blockedUses) {
    if (!clauseMatchesCase(consentCase, clause)) {
      continue;
    }

    matches.add(clause);
  }

  return Array.from(matches);
}
