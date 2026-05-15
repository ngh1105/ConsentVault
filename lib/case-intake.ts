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

export type ExternalUrlStatus = "empty" | "invalid" | "valid";

export interface ExternalUrlAssessment {
  raw: string;
  normalized: string;
  href: string;
  status: ExternalUrlStatus;
}

export interface EvidencePreviewItem extends EvidenceItem {
  previewUrlText?: string;
}

const DEFAULT_TITLE = "Untitled dispute";
const ALLOWED_URL_PROTOCOLS = new Set(["http:", "https:"]);

function trimText(value: string): string {
  return value.trim();
}

function normalizeTitle(title: string): string {
  return trimText(title) || DEFAULT_TITLE;
}

export function assessExternalUrl(url: string): ExternalUrlAssessment {
  const raw = trimText(url);

  if (!raw) {
    return {
      raw: "",
      normalized: "",
      href: "",
      status: "empty",
    };
  }

  try {
    const parsedUrl = new URL(raw);

    if (!ALLOWED_URL_PROTOCOLS.has(parsedUrl.protocol)) {
      return {
        raw,
        normalized: "",
        href: "",
        status: "invalid",
      };
    }

    const normalized = parsedUrl.toString();

    return {
      raw,
      normalized,
      href: normalized,
      status: "valid",
    };
  } catch {
    return {
      raw,
      normalized: "",
      href: "",
      status: "invalid",
    };
  }
}

function normalizeExternalUrl(url: string): string {
  return assessExternalUrl(url).normalized;
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

function buildPreviewUrlText(assessment: ExternalUrlAssessment): string | undefined {
  return assessment.status === "invalid" ? assessment.raw : undefined;
}

function buildPreviewEvidenceItem(args: {
  id: string;
  type: EvidenceItem["type"];
  title: string;
  urlInput: string;
  description: string;
  capturedAt: string;
}): EvidencePreviewItem {
  const urlAssessment = assessExternalUrl(args.urlInput);
  const previewUrlText = buildPreviewUrlText(urlAssessment);

  return {
    id: args.id,
    type: args.type,
    title: args.title,
    url: urlAssessment.normalized,
    ...(previewUrlText ? { previewUrlText } : {}),
    description: args.description,
    capturedAt: args.capturedAt,
  };
}

export function normalizeIntakeSubmission(submission: IntakeSubmission): IntakeSubmission {
  return {
    title: normalizeTitle(submission.title),
    sourceUrl: normalizeExternalUrl(submission.sourceUrl),
    aiOutputUrl: normalizeExternalUrl(submission.aiOutputUrl),
    platformUrl: normalizeExternalUrl(submission.platformUrl),
    notes: trimText(submission.notes),
  };
}

export function buildEvidenceBundlePreview(submission: IntakeSubmission): EvidencePreviewItem[] {
  const normalizedTitle = normalizeTitle(submission.title);
  const normalizedNotes = trimText(submission.notes);
  const titleSlug = slugify(normalizedTitle);

  return [
    buildPreviewEvidenceItem({
      id: `${titleSlug}-source`,
      type: "source",
      title: `${normalizedTitle} source record`,
      urlInput: submission.sourceUrl,
      description: buildDescription("Original creator source gathered", normalizedTitle, normalizedNotes),
      capturedAt: `${titleSlug}-source-captured`,
    }),
    buildPreviewEvidenceItem({
      id: `${titleSlug}-output`,
      type: "output",
      title: `${normalizedTitle} AI output`,
      urlInput: submission.aiOutputUrl,
      description: buildDescription("AI-generated output gathered", normalizedTitle, normalizedNotes),
      capturedAt: `${titleSlug}-output-captured`,
    }),
    buildPreviewEvidenceItem({
      id: `${titleSlug}-platform`,
      type: "platform",
      title: `${normalizedTitle} platform listing`,
      urlInput: submission.platformUrl,
      description: buildDescription("Platform listing gathered", normalizedTitle, normalizedNotes),
      capturedAt: `${titleSlug}-platform-captured`,
    }),
  ];
}

export function buildPreparedIntakeCaseSubmission(
  submission: IntakeSubmission & { policyId: string },
  options?: { id?: string; createdAt?: string },
): PreparedIntakeCaseSubmission {
  const normalized = normalizeIntakeSubmission(submission);
  const titleSlug = slugify(normalized.title);
  const evidenceItems = buildEvidenceBundlePreview(normalized).map((item) => {
    if (!("previewUrlText" in item)) {
      return item;
    }

    const safeItem = { ...item };
    delete safeItem.previewUrlText;

    return safeItem;
  });

  return {
    ...normalized,
    policyId: submission.policyId,
    id: options?.id ?? `case-${titleSlug}-${Date.now()}`,
    createdAt: options?.createdAt ?? new Date().toISOString(),
    evidenceItems,
  };
}
