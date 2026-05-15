import type { ValidatorJudgment } from "@/lib/domain";
import type { TrialEngine, TrialInput, TrialResult } from "@/lib/trial-engine";
import { aggregateVerdict } from "@/lib/verdict";

function referencesImpersonation(input: TrialInput) {
  const content = `${input.case.notes} ${input.case.aiOutput} ${input.policy.blockedUses.join(" ")}`.toLowerCase();
  return /(imitat|mimic|voice clone|voice cloning|synthetic avatar|likeness|endorsement)/.test(content);
}

function missesAttribution(input: TrialInput) {
  const content = `${input.case.notes} ${input.case.aiOutput} ${input.policy.attributionRules}`.toLowerCase();
  return /(without credit|without crediting|strips attribution|removed the required credit|missing credit|omitted)/.test(
    content,
  );
}

function needsLicense(input: TrialInput) {
  const content = `${input.case.notes} ${input.case.originalContent} ${input.case.aiOutput} ${input.policy.licenseRules}`.toLowerCase();
  return /(commercial|paid|subscriber-only|premium|sales deck|license)/.test(content);
}

function hasHighSeverityBlockedUse(input: TrialInput) {
  const blocked = input.policy.blockedUses.join(" ").toLowerCase();
  return /(voice cloning|synthetic avatars|exclusive sublicensing|dataset resale)/.test(blocked);
}

function createJudgment(
  id: string,
  validatorName: string,
  verdict: ValidatorJudgment["verdict"],
  confidence: number,
  reasoning: string,
  citedEvidenceIds: string[],
): ValidatorJudgment {
  return {
    id,
    validatorName,
    verdict,
    confidence,
    reasoning,
    citedEvidenceIds,
  };
}

function buildJudgments(input: TrialInput): ValidatorJudgment[] {
  const evidenceIds = input.case.evidenceItems.map((item) => item.id);
  const outputAndPlatformEvidence = input.case.evidenceItems
    .filter((item) => item.type === "output" || item.type === "platform")
    .map((item) => item.id);
  const policyEvidence = input.case.evidenceItems
    .filter((item) => item.type === "policy")
    .map((item) => item.id);

  if (referencesImpersonation(input) && hasHighSeverityBlockedUse(input)) {
    return [
      createJudgment(
        "validator-signal-house",
        "Signal House",
        "Impersonation Risk",
        0.94,
        "The output mirrors the creator's identity markers and collides with blocked impersonation clauses.",
        outputAndPlatformEvidence.length > 0 ? outputAndPlatformEvidence : evidenceIds,
      ),
      createJudgment(
        "validator-persona-watch",
        "Persona Watch",
        "Impersonation Risk",
        0.89,
        "Policy language forbids synthetic likeness use and the archived output reads like a direct endorsement.",
        evidenceIds.slice(0, 3),
      ),
      createJudgment(
        "validator-rights-ledger",
        "Rights Ledger",
        "Needs License",
        0.76,
        "Commercial distribution cues are present, but the sharper consensus issue is unauthorized persona imitation.",
        evidenceIds.slice(0, 2),
      ),
    ];
  }

  if (missesAttribution(input)) {
    const cited = policyEvidence.length > 0 ? [...evidenceIds.slice(0, 2), ...policyEvidence] : evidenceIds;

    return [
      createJudgment(
        "validator-archive-review",
        "Archive Review",
        "Needs Attribution",
        0.86,
        "The use appears otherwise allowed, but required creator credit is missing from the derivative output.",
        cited,
      ),
      createJudgment(
        "validator-transparency-lab",
        "Transparency Lab",
        "Needs Attribution",
        0.84,
        "Synthetic labeling and backlink requirements were not preserved in the published recap.",
        cited,
      ),
      createJudgment(
        "validator-public-interest-lab",
        "Public Interest Lab",
        "Allowed",
        0.65,
        "The remix category is broadly permitted, assuming attribution gets restored as the policy requires.",
        evidenceIds.slice(0, 2),
      ),
    ];
  }

  if (needsLicense(input)) {
    return [
      createJudgment(
        "validator-rights-ledger",
        "Rights Ledger",
        "Needs License",
        0.92,
        "Commercial or subscriber-only reuse exceeds the standing permission grant in the policy.",
        evidenceIds,
      ),
      createJudgment(
        "validator-market-audit",
        "Market Audit",
        "Needs License",
        0.87,
        "Distribution posture suggests a licensing event rather than ordinary fair or policy-authorized reuse.",
        evidenceIds.slice(0, 2),
      ),
      createJudgment(
        "validator-compliance-desk",
        "Compliance Desk",
        "Needs Attribution",
        0.61,
        "Metadata cleanup may still be warranted, but the stronger issue is missing commercialization approval.",
        evidenceIds.slice(0, 2),
      ),
    ];
  }

  return [
    createJudgment(
      "validator-public-interest-lab",
      "Public Interest Lab",
      "Allowed",
      0.83,
      "The case aligns with the published allowances and the evidence trail preserves the creator's conditions.",
      evidenceIds,
    ),
    createJudgment(
      "validator-model-safety-forum",
      "Model Safety Forum",
      "Allowed",
      0.8,
      "No blocked-use signal dominates the record and the reuse fits the policy's low-risk lane.",
      evidenceIds.slice(0, 2),
    ),
    createJudgment(
      "validator-archive-review",
      "Archive Review",
      "Needs Attribution",
      0.58,
      "A minor metadata reminder remains, but it does not outweigh the generally permitted use pattern.",
      evidenceIds.slice(0, 2),
    ),
  ];
}

class DeterministicMockTrialEngine implements TrialEngine {
  async runTrial(input: TrialInput): Promise<TrialResult> {
    const judgments = buildJudgments(input);
    const receipt = aggregateVerdict({ ...input, judgments });

    return {
      judgments,
      receipt,
    };
  }
}

const mockTrialEngine = new DeterministicMockTrialEngine();

export function createMockTrialEngine(): TrialEngine {
  return mockTrialEngine;
}

export async function runMockTrial(input: TrialInput): Promise<TrialResult> {
  return mockTrialEngine.runTrial(input);
}
