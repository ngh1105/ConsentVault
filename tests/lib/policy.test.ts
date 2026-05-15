import { describe, expect, it } from "vitest";
import type { ConsentPolicy } from "@/lib/domain";
import { normalizeBlockedUses, savePolicyDraft, type PolicyDraft } from "@/lib/policy";

describe("normalizeBlockedUses", () => {
  it("splits comma-separated input into trimmed unique clauses", () => {
    expect(normalizeBlockedUses("voice clone, impersonation, remix, voice clone")).toEqual([
      "voice clone",
      "impersonation",
      "remix",
    ]);
  });

  it("normalizes arrays by trimming, dropping empties, and deduplicating case-insensitively", () => {
    expect(normalizeBlockedUses(["  Voice Clone  ", "", "impersonation", "voice clone"])).toEqual([
      "Voice Clone",
      "impersonation",
    ]);
  });
});

describe("savePolicyDraft", () => {
  it("preserves id and createdAt while trimming text fields and normalizing uses", () => {
    const policy: ConsentPolicy = {
      id: "policy-1",
      creatorName: "Existing Creator",
      creatorHandle: "@existing",
      allowedUses: ["Existing"],
      blockedUses: ["Existing Block"],
      attributionRules: "Old attribution",
      licenseRules: "Old license",
      jurisdictionNote: "Old jurisdiction",
      createdAt: "2026-05-15T09:00:00.000Z",
    };

    const draft: PolicyDraft = {
      creatorName: "  Mara Ellison  ",
      creatorHandle: "  @maraellison ",
      allowedUsesText: " editorial commentary, private classroom critique, editorial commentary ",
      blockedUses: [" voice clone ", "Impersonation", "voice clone"],
      attributionRules: "  Credit the creator in the first line.  ",
      licenseRules: "  Commercial reuse needs approval.  ",
      jurisdictionNote: "  California publicity rights reserved.  ",
    };

    expect(savePolicyDraft(policy, draft)).toEqual({
      id: "policy-1",
      creatorName: "Mara Ellison",
      creatorHandle: "@maraellison",
      allowedUses: ["editorial commentary", "private classroom critique"],
      blockedUses: ["voice clone", "Impersonation"],
      attributionRules: "Credit the creator in the first line.",
      licenseRules: "Commercial reuse needs approval.",
      jurisdictionNote: "California publicity rights reserved.",
      createdAt: "2026-05-15T09:00:00.000Z",
    });
  });
});
