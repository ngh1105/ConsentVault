import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PolicyForm } from "@/components/policy/policy-form";
import type { PolicyDraft } from "@/lib/policy";

const draft: PolicyDraft = {
  creatorName: "Mara Ellison",
  creatorHandle: "@maraellison",
  allowedUsesText: "editorial commentary, classroom critique",
  blockedUses: ["Voice cloning"],
  attributionRules: "Credit the creator in the first line.",
  licenseRules: "Commercial reuse needs approval.",
  jurisdictionNote: "California publicity rights reserved.",
};

describe("PolicyForm", () => {
  it("associates the blocked use input with the visible label and helper text", () => {
    render(
      <PolicyForm
        draft={draft}
        blockedUseInput=""
        blockedUseChips={draft.blockedUses}
        isSaving={false}
        onFieldChange={vi.fn()}
        onBlockedUseInputChange={vi.fn()}
        onAddBlockedUses={vi.fn()}
        onRemoveBlockedUse={vi.fn()}
        onReset={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const blockedUsesInput = screen.getByRole("textbox", { name: "Blocked uses" });
    const label = screen.getByText("Blocked uses");
    const helper = screen.getByText("Add restricted use clauses as tags. Separate multiple clauses with commas.");

    expect(blockedUsesInput).toHaveAttribute("aria-labelledby", label.id);
    expect(blockedUsesInput).toHaveAttribute("aria-describedby", helper.id);
  });
});
