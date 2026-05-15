import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EvidenceBundlePreview } from "@/components/intake/evidence-bundle-preview";
import type { EvidenceItem } from "@/lib/domain";

function createEvidenceItem(id: string, title: string): EvidenceItem {
  return {
    id,
    type: id.endsWith("source") ? "source" : id.endsWith("output") ? "output" : "platform",
    title,
    url: `https://example.com/${id}`,
    description: `${title} description`,
    capturedAt: `${id}-captured`,
  };
}

afterEach(() => {
  cleanup();
});

describe("EvidenceBundlePreview", () => {
  it("renders every supplied evidence card and warns when the preview count is not exactly three", () => {
    render(
      <EvidenceBundlePreview
        items={[
          createEvidenceItem("voice-clone-source", "Source record"),
          createEvidenceItem("voice-clone-output", "AI output"),
          createEvidenceItem("voice-clone-platform", "Platform listing"),
          createEvidenceItem("voice-clone-platform-extra", "Supplemental platform note"),
        ]}
      />,
    );

    expect(screen.getByText("Source record")).toBeVisible();
    expect(screen.getByText("AI output")).toBeVisible();
    expect(screen.getByText("Platform listing")).toBeVisible();
    expect(screen.getByText("Supplemental platform note")).toBeVisible();
    expect(
      screen.getByText(/Expected exactly 3 evidence records before filing, but received 4\./i),
    ).toBeVisible();
  });

  it("shows an empty-state warning when no evidence records are supplied", () => {
    render(<EvidenceBundlePreview items={[]} />);

    expect(
      screen.getByText(/No evidence records are available yet\. Add the source, AI output, and platform listing to restore the three-card preview\./i),
    ).toBeVisible();
  });
});
