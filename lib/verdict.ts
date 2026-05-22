import type { ValidatorJudgment } from "@/lib/domain";

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
