import { describe, expect, it } from "vitest";
import type { ConsentCase, ConsentPolicy } from "@/lib/domain";
import { matchPolicyClauses } from "@/lib/evidence";
import { sampleCases, samplePolicies } from "@/lib/sample-data";

describe("matchPolicyClauses", () => {
  it("returns the blocked clauses that match the selected case", () => {
    const matches = matchPolicyClauses(sampleCases[0], samplePolicies[0]);
    expect(matches).toContain("impersonation");
    expect(matches).not.toContain("commercial remix");
  });

  it("matches clauses case-insensitively", () => {
    const consentCase: ConsentCase = {
      id: "case-uppercase",
      title: "Celebrity IMPERSONATION complaint",
      status: "In Review",
      policyId: "policy-uppercase",
      sourceUrl: "https://creator.example/source",
      aiOutputUrl: "https://ai.example/output",
      platformUrl: "https://platform.example/post",
      notes: "Recorded for review",
      originalContent: "Archived original clip",
      aiOutput: "Synthetic response under appeal",
      evidenceItems: [
        {
          id: "evidence-uppercase",
          type: "note",
          title: "Moderator note",
          url: "",
          description: "Flagged as an IMPERSONATION incident in the review queue.",
          capturedAt: "2026-05-15T09:00:00.000Z",
        },
      ],
      createdAt: "2026-05-15T09:00:00.000Z",
    };

    const policy: ConsentPolicy = {
      id: "policy-uppercase",
      creatorName: "Archive Creator",
      creatorHandle: "@archivecreator",
      allowedUses: [],
      blockedUses: ["impersonation", "voice cloning"],
      attributionRules: "",
      licenseRules: "",
      jurisdictionNote: "",
      createdAt: "2026-05-15T09:00:00.000Z",
    };

    expect(matchPolicyClauses(consentCase, policy)).toEqual(["impersonation"]);
  });

  it("returns unique matches even when the same clause appears multiple times", () => {
    const consentCase: ConsentCase = {
      id: "case-duplicates",
      title: "Dataset resale alert",
      status: "In Review",
      policyId: "policy-duplicates",
      sourceUrl: "https://creator.example/source",
      aiOutputUrl: "https://ai.example/output",
      platformUrl: "https://platform.example/post",
      notes: "Commercial dataset resale appears in the intake note.",
      originalContent: "Commercial dataset resale was forbidden in the original archive brief.",
      aiOutput: "Dataset resale pitch copied from the creator archive.",
      evidenceItems: [
        {
          id: "evidence-duplicates",
          type: "platform",
          title: "Dataset resale ad",
          url: "https://platform.example/post",
          description: "Commercial dataset resale listing captured for appeal.",
          capturedAt: "2026-05-15T09:00:00.000Z",
        },
      ],
      createdAt: "2026-05-15T09:00:00.000Z",
    };

    const policy: ConsentPolicy = {
      id: "policy-duplicates",
      creatorName: "Archive Creator",
      creatorHandle: "@archivecreator",
      allowedUses: [],
      blockedUses: ["commercial dataset resale", "commercial dataset resale"],
      attributionRules: "",
      licenseRules: "",
      jurisdictionNote: "",
      createdAt: "2026-05-15T09:00:00.000Z",
    };

    expect(matchPolicyClauses(consentCase, policy)).toEqual(["commercial dataset resale"]);
  });

  it("returns an empty array for empty or mismatched blocked clauses", () => {
    const emptyPolicy: ConsentPolicy = {
      id: "policy-empty",
      creatorName: "Archive Creator",
      creatorHandle: "@archivecreator",
      allowedUses: [],
      blockedUses: [],
      attributionRules: "",
      licenseRules: "",
      jurisdictionNote: "",
      createdAt: "2026-05-15T09:00:00.000Z",
    };

    const mismatchedPolicy: ConsentPolicy = {
      ...samplePolicies[1],
      id: "policy-mismatch",
      blockedUses: ["exclusive sublicensing without approval"],
    };

    expect(matchPolicyClauses(sampleCases[0], emptyPolicy)).toEqual([]);
    expect(matchPolicyClauses(sampleCases[0], mismatchedPolicy)).toEqual([]);
  });
});
