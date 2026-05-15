import type { EvidenceItem } from "@/lib/domain";

export interface IntakeSubmission {
  title: string;
  sourceUrl: string;
  aiOutputUrl: string;
  platformUrl: string;
  notes: string;
}

export interface PreparedIntakeCaseSubmission extends IntakeSubmission {
  id: string;
  policyId: string;
  createdAt: string;
  evidenceItems: EvidenceItem[];
}

const DEFAULT_TITLE = "Untitled dispute";

function trimText(value: string): string {
  return value.trim();
}

function normalizeTitle(title: string): string {
  return trimText(title) || DEFAULT_TITLE;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "untitled-dispute";
}

function buildDescription(base: string, title: string, notes: string): string {
  return notes ? `${base} for ${title}. ${notes}` : `${base} for ${title}.`;
}

export function normalizeIntakeSubmission(submission: IntakeSubmission): IntakeSubmission {
  return {
    title: normalizeTitle(submission.title),
    sourceUrl: trimText(submission.sourceUrl),
    aiOutputUrl: trimText(submission.aiOutputUrl),
    platformUrl: trimText(submission.platformUrl),
    notes: trimText(submission.notes),
  };
}

export function buildEvidenceBundlePreview(submission: IntakeSubmission): EvidenceItem[] {
  const normalized = normalizeIntakeSubmission(submission);
  const titleSlug = slugify(normalized.title);

  return [
    {
      id: `${titleSlug}-source`,
      type: "source",
      title: `${normalized.title} source record`,
      url: normalized.sourceUrl,
      description: buildDescription("Original creator source gathered", normalized.title, normalized.notes),
      capturedAt: `${titleSlug}-source-captured`,
    },
    {
      id: `${titleSlug}-output`,
      type: "output",
      title: `${normalized.title} AI output`,
      url: normalized.aiOutputUrl,
      description: buildDescription("AI-generated output gathered", normalized.title, normalized.notes),
      capturedAt: `${titleSlug}-output-captured`,
    },
    {
      id: `${titleSlug}-platform`,
      type: "platform",
      title: `${normalized.title} platform listing`,
      url: normalized.platformUrl,
      description: buildDescription("Platform listing gathered", normalized.title, normalized.notes),
      capturedAt: `${titleSlug}-platform-captured`,
    },
  ];
}

export function buildPreparedIntakeCaseSubmission(
  submission: IntakeSubmission & { policyId: string },
  options?: { id?: string; createdAt?: string },
): PreparedIntakeCaseSubmission {
  const normalized = normalizeIntakeSubmission(submission);
  const titleSlug = slugify(normalized.title);

  return {
    ...normalized,
    policyId: submission.policyId,
    id: options?.id ?? `case-${titleSlug}-${Date.now()}`,
    createdAt: options?.createdAt ?? new Date().toISOString(),
    evidenceItems: buildEvidenceBundlePreview(normalized),
  };
}
