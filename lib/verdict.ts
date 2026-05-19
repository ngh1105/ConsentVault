import type { EvidenceItem, ValidatorJudgment, VerdictCategory, VerdictReceipt } from "@/lib/domain";
import type { TrialInput } from "@/lib/trial-engine";

const verdictPriority: Record<VerdictCategory, number> = {
  Allowed: 1,
  "Needs Attribution": 2,
  "Needs License": 3,
  "Impersonation Risk": 4,
  Violation: 5,
};

const verdictCopy: Record<
  VerdictCategory,
  {
    summary: (creatorName: string, evidenceCount: number, supportCount: number) => string;
    recommendedAction: (creatorName: string) => string;
  }
> = {
  Allowed: {
    summary: (creatorName, evidenceCount, supportCount) =>
      `${supportCount} validators found the use compatible with ${creatorName}'s policy after reviewing ${evidenceCount} linked evidence references.`,
    recommendedAction: () =>
      "Archive the receipt, preserve the evidence trail, and monitor for future policy drift.",
  },
  "Needs Attribution": {
    summary: (creatorName, evidenceCount, supportCount) =>
      `${supportCount} validators agreed the reuse is likely permissible, but ${creatorName}'s attribution requirements were not carried through the ${evidenceCount} cited records.`,
    recommendedAction: (creatorName) =>
      `Request corrected crediting and synthetic labeling before escalating beyond ${creatorName}'s policy workflow.`,
  },
  "Needs License": {
    summary: (creatorName, evidenceCount, supportCount) =>
      `${supportCount} validators found that the reuse exceeds ${creatorName}'s standing permissions and points to a licensing gap across ${evidenceCount} cited records.`,
    recommendedAction: () =>
      "Pause further distribution and obtain a documented license or remove the reused material.",
  },
  "Impersonation Risk": {
    summary: (creatorName, evidenceCount, supportCount) =>
      `${supportCount} validators detected likely identity imitation tied to ${creatorName}'s protected persona, supported by ${evidenceCount} cited evidence references.`,
    recommendedAction: () =>
      "Escalate to trust and safety with the evidence bundle and request urgent review for deceptive synthetic media.",
  },
  Violation: {
    summary: (creatorName, evidenceCount, supportCount) =>
      `${supportCount} validators concluded the reuse conflicts directly with ${creatorName}'s policy and the ${evidenceCount} cited records support enforcement-ready escalation.`,
    recommendedAction: () =>
      "Preserve the receipt, notify the platform, and prepare a formal enforcement or takedown request.",
  },
};

export interface AggregateVerdictInput extends TrialInput {
  judgments: ValidatorJudgment[];
}

export function clampPercentageScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function toPercentageScore(score: number) {
  return clampPercentageScore(score);
}

export function formatConfidence(score: number) {
  return `${toPercentageScore(score)}% confidence`;
}

export function collectCitedEvidenceIds(judgments: ValidatorJudgment[]) {
  return Array.from(new Set(judgments.flatMap((judgment) => judgment.citedEvidenceIds)));
}

export function collectCitedEvidence(
  judgments: ValidatorJudgment[],
  evidenceItems: EvidenceItem[],
) {
  const citedIds = new Set(collectCitedEvidenceIds(judgments));
  return evidenceItems.filter((item) => citedIds.has(item.id));
}

export function aggregateVerdict({
  case: consentCase,
  policy,
  judgments,
  wallet,
}: AggregateVerdictInput): VerdictReceipt {
  if (judgments.length === 0) {
    throw new Error("aggregateVerdict requires at least one validator judgment");
  }

  const totals = judgments.reduce<Record<VerdictCategory, number>>(
    (accumulator, judgment) => {
      accumulator[judgment.verdict] += judgment.confidence;
      return accumulator;
    },
    {
      Allowed: 0,
      "Needs Attribution": 0,
      "Needs License": 0,
      "Impersonation Risk": 0,
      Violation: 0,
    },
  );

  const finalVerdict = (Object.entries(totals) as Array<[VerdictCategory, number]>).sort(
    ([leftVerdict, leftScore], [rightVerdict, rightScore]) => {
      if (rightScore !== leftScore) {
        return rightScore - leftScore;
      }

      return verdictPriority[rightVerdict] - verdictPriority[leftVerdict];
    },
  )[0][0];

  const supportingJudgments = judgments.filter((judgment) => judgment.verdict === finalVerdict);
  const supportingEvidenceCount = collectCitedEvidenceIds(supportingJudgments).length;
  const averageConfidence =
    supportingJudgments.reduce((sum, judgment) => sum + judgment.confidence, 0) /
    supportingJudgments.length;

  return {
    id: `receipt-${consentCase.id}-trial`,
    caseId: consentCase.id,
    finalVerdict,
    score: clampPercentageScore(averageConfidence * 100),
    summary: verdictCopy[finalVerdict].summary(
      policy.creatorName,
      supportingEvidenceCount,
      supportingJudgments.length,
    ),
    recommendedAction: verdictCopy[finalVerdict].recommendedAction(policy.creatorName),
    judgments,
    createdAt: consentCase.createdAt,
    wallet,
  };
}
