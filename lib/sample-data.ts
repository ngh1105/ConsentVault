import type {
  ConsentCase,
  ConsentPolicy,
  ValidatorJudgment,
  VerdictReceipt,
} from "@/lib/domain";

const baseTimestamp = "2026-05-15T09:00:00.000Z";

export const restrictivePolicy: ConsentPolicy = {
  id: "policy-restrictive",
  creatorName: "Mara Ellison",
  creatorHandle: "@maraellison",
  allowedUses: [
    "Editorial commentary with explicit credit",
    "Private classroom critique excerpts under 30 seconds",
  ],
  blockedUses: [
    "Voice cloning for ads or endorsements",
    "Synthetic avatars that imitate the creator's likeness",
    "Commercial dataset resale",
  ],
  attributionRules: "Credit Mara Ellison by name and handle in the first visible line.",
  licenseRules: "Commercial reuse requires a signed license and a dated project scope.",
  jurisdictionNote: "Creator reserves additional publicity rights protections in California.",
  createdAt: baseTimestamp,
};

export const permissivePolicy: ConsentPolicy = {
  id: "policy-permissive",
  creatorName: "Jonah Vale",
  creatorHandle: "@jonahvale",
  allowedUses: [
    "Non-commercial remixing with attribution",
    "Model evaluation and safety benchmarking",
    "Parody that does not imply sponsorship",
  ],
  blockedUses: [
    "Removing attribution from reused excerpts",
    "Training on private subscriber-only releases",
    "Exclusive sublicensing without approval",
  ],
  attributionRules: "Link back to the original post and label the derivative work as synthetic.",
  licenseRules: "Revenue-generating reuse needs a lightweight license confirmation email.",
  jurisdictionNote: "Policy drafted to align with UK and EU consumer transparency expectations.",
  createdAt: "2026-05-14T15:45:00.000Z",
};

export const samplePolicies: ConsentPolicy[] = [restrictivePolicy, permissivePolicy];

const evidence = (
  id: string,
  type: ConsentCase["evidenceItems"][number]["type"],
  title: string,
  url: string,
  description: string,
  capturedAt: string,
) => ({ id, type, title, url, description, capturedAt });

export const impersonationCase: ConsentCase = {
  id: "case-voice-clone",
  title: "Voice clone dispute",
  status: "In Review",
  policyId: restrictivePolicy.id,
  sourceUrl: "https://creator.example/mara/original-podcast",
  aiOutputUrl: "https://ai.example/renders/voice-clone",
  platformUrl: "https://platform.example/posts/mara-endorsement",
  notes: "Audio ad appears to mimic the creator's voice cadence and endorsement style.",
  originalContent: "Original podcast narration discussing creator-owned licensing boundaries.",
  aiOutput: "Synthetic audio ad that sounds like a direct endorsement of a fintech app.",
  evidenceItems: [
    evidence(
      "ev-imp-source",
      "source",
      "Original podcast clip",
      "https://creator.example/mara/original-podcast",
      "Reference clip from the creator's official podcast feed.",
      "2026-05-15T09:10:00.000Z",
    ),
    evidence(
      "ev-imp-output",
      "output",
      "Synthetic ad output",
      "https://ai.example/renders/voice-clone",
      "Generated voice sample captured from the ad network archive.",
      "2026-05-15T09:12:00.000Z",
    ),
    evidence(
      "ev-imp-platform",
      "platform",
      "Platform listing",
      "https://platform.example/posts/mara-endorsement",
      "Sponsored placement page showing the synthetic endorsement.",
      "2026-05-15T09:14:00.000Z",
    ),
  ],
  createdAt: "2026-05-15T09:05:00.000Z",
};

export const attributionCase: ConsentCase = {
  id: "case-attribution-gap",
  title: "Attribution omitted from recap clip",
  status: "Draft",
  policyId: permissivePolicy.id,
  sourceUrl: "https://creator.example/jonah/thread",
  aiOutputUrl: "https://ai.example/outputs/recap-video",
  platformUrl: "https://platform.example/video/jonah-recap",
  notes: "Derivative recap clip mirrors the original thread but strips attribution metadata.",
  originalContent: "Thread outlining a release checklist for transparent synthetic media.",
  aiOutput: "A short recap video using the thread's phrasing without crediting the author.",
  evidenceItems: [
    evidence(
      "ev-att-source",
      "source",
      "Original checklist thread",
      "https://creator.example/jonah/thread",
      "Primary reference thread authored by Jonah Vale.",
      "2026-05-14T16:10:00.000Z",
    ),
    evidence(
      "ev-att-output",
      "output",
      "Recap video",
      "https://ai.example/outputs/recap-video",
      "AI recap video with near-verbatim checklist language.",
      "2026-05-14T16:18:00.000Z",
    ),
    evidence(
      "ev-att-policy",
      "policy",
      "Policy snapshot",
      "https://creator.example/jonah/policy",
      "Published policy requiring attribution and synthetic labeling.",
      "2026-05-14T16:20:00.000Z",
    ),
  ],
  createdAt: "2026-05-14T16:00:00.000Z",
};

const licensingCase: ConsentCase = {
  id: "case-license-needed",
  title: "Commercial training deck reuse",
  status: "Verdict Ready",
  policyId: restrictivePolicy.id,
  sourceUrl: "https://creator.example/mara/masterclass",
  aiOutputUrl: "https://ai.example/outputs/sales-deck",
  platformUrl: "https://workspace.example/decks/q2-pitch",
  notes: "Slides adapt premium training material into a sales deck for a paid campaign.",
  originalContent: "Paid masterclass explaining creator contract redlines and negotiation scripts.",
  aiOutput: "A campaign sales deck generated from premium class notes and screenshots.",
  evidenceItems: [
    evidence(
      "ev-lic-source",
      "source",
      "Masterclass archive",
      "https://creator.example/mara/masterclass",
      "Subscriber-only educational archive.",
      "2026-05-13T12:00:00.000Z",
    ),
    evidence(
      "ev-lic-output",
      "output",
      "Generated sales deck",
      "https://ai.example/outputs/sales-deck",
      "Commercial deck reusing premium training material.",
      "2026-05-13T12:12:00.000Z",
    ),
  ],
  createdAt: "2026-05-13T11:55:00.000Z",
};

const allowedCase: ConsentCase = {
  id: "case-allowed-benchmark",
  title: "Model safety benchmark excerpt",
  status: "Verdict Ready",
  policyId: permissivePolicy.id,
  sourceUrl: "https://creator.example/jonah/benchmark-guide",
  aiOutputUrl: "https://lab.example/reports/safety-benchmark",
  platformUrl: "https://lab.example/reports/safety-benchmark",
  notes: "Research team reused short excerpts for a non-commercial benchmark report with clear labels.",
  originalContent: "Guide for evaluating hallucination risk in synthetic media pipelines.",
  aiOutput: "Benchmark report with attributed excerpts and synthetic content labeling.",
  evidenceItems: [
    evidence(
      "ev-all-source",
      "source",
      "Benchmark guide",
      "https://creator.example/jonah/benchmark-guide",
      "Open guide published for model evaluation use.",
      "2026-05-12T08:35:00.000Z",
    ),
    evidence(
      "ev-all-output",
      "output",
      "Safety benchmark report",
      "https://lab.example/reports/safety-benchmark",
      "Non-commercial report with attribution preserved.",
      "2026-05-12T08:42:00.000Z",
    ),
  ],
  createdAt: "2026-05-12T08:30:00.000Z",
};

export const sampleCases: ConsentCase[] = [
  impersonationCase,
  attributionCase,
  licensingCase,
  allowedCase,
];

const impersonationJudgment: ValidatorJudgment = {
  id: "judgment-impersonation",
  validatorName: "Signal House",
  verdict: "Impersonation Risk",
  confidence: 0.93,
  reasoning: "The output imitates the creator's voice and implies a direct endorsement.",
  citedEvidenceIds: ["ev-imp-source", "ev-imp-output", "ev-imp-platform"],
};

const attributionJudgment: ValidatorJudgment = {
  id: "judgment-attribution",
  validatorName: "Archive Review",
  verdict: "Needs Attribution",
  confidence: 0.88,
  reasoning: "Reuse is likely allowed, but the derivative clip removed the required credit line.",
  citedEvidenceIds: ["ev-att-source", "ev-att-output", "ev-att-policy"],
};

const licensingJudgment: ValidatorJudgment = {
  id: "judgment-license",
  validatorName: "Rights Ledger",
  verdict: "Needs License",
  confidence: 0.91,
  reasoning: "Commercial adaptation of subscriber-only material exceeds the baseline policy grant.",
  citedEvidenceIds: ["ev-lic-source", "ev-lic-output"],
};

const allowedJudgment: ValidatorJudgment = {
  id: "judgment-allowed",
  validatorName: "Public Interest Lab",
  verdict: "Allowed",
  confidence: 0.82,
  reasoning: "The benchmark report fits the policy's non-commercial evaluation allowance.",
  citedEvidenceIds: ["ev-all-source", "ev-all-output"],
};

const violationJudgment: ValidatorJudgment = {
  id: "judgment-violation",
  validatorName: "Enforcement Desk",
  verdict: "Violation",
  confidence: 0.95,
  reasoning: "The sponsored distribution appears intentionally deceptive and conflicts with every blocked-use clause.",
  citedEvidenceIds: ["ev-imp-output", "ev-imp-platform"],
};

export const sampleJudgments: ValidatorJudgment[] = [
  impersonationJudgment,
  attributionJudgment,
  licensingJudgment,
  allowedJudgment,
  violationJudgment,
];

export const sampleReceipt: VerdictReceipt = {
  id: "receipt-impersonation",
  caseId: impersonationCase.id,
  finalVerdict: "Impersonation Risk",
  score: 93,
  summary: "Validators agreed that the synthetic ad strongly suggests unauthorized voice impersonation.",
  recommendedAction: "Escalate to platform trust and safety with evidence bundle and takedown request.",
  judgments: [impersonationJudgment, violationJudgment],
  createdAt: "2026-05-15T10:00:00.000Z",
};

const attributionReceipt: VerdictReceipt = {
  id: "receipt-attribution",
  caseId: attributionCase.id,
  finalVerdict: "Needs Attribution",
  score: 88,
  summary: "The derivative recap can stay up if attribution and synthetic disclosure are restored.",
  recommendedAction: "Request metadata and caption corrections before escalating further.",
  judgments: [attributionJudgment],
  createdAt: "2026-05-14T17:00:00.000Z",
};

const licensingReceipt: VerdictReceipt = {
  id: "receipt-license",
  caseId: licensingCase.id,
  finalVerdict: "Needs License",
  score: 91,
  summary: "Commercial reuse of premium material needs explicit licensing before further distribution.",
  recommendedAction: "Pause the deck and negotiate a commercial license or remove the reused material.",
  judgments: [licensingJudgment],
  createdAt: "2026-05-13T13:15:00.000Z",
};

const allowedReceipt: VerdictReceipt = {
  id: "receipt-allowed",
  caseId: allowedCase.id,
  finalVerdict: "Allowed",
  score: 82,
  summary: "Use falls within the creator's published benchmark and evaluation permissions.",
  recommendedAction: "Document the evidence trail and keep attribution attached to future reposts.",
  judgments: [allowedJudgment],
  createdAt: "2026-05-12T09:15:00.000Z",
};

export const sampleReceipts: VerdictReceipt[] = [
  sampleReceipt,
  attributionReceipt,
  licensingReceipt,
  allowedReceipt,
];
