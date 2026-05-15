import { describe, expect, it } from "vitest";
import { assessExternalUrl, buildEvidenceBundlePreview } from "@/lib/case-intake";

describe("buildEvidenceBundlePreview", () => {
  it("classifies external urls as empty, invalid, or allowed", () => {
    expect(assessExternalUrl("   ")).toEqual({
      raw: "",
      normalized: "",
      href: "",
      status: "empty",
    });

    expect(assessExternalUrl(" javascript:alert(1) ")).toEqual({
      raw: "javascript:alert(1)",
      normalized: "",
      href: "",
      status: "invalid",
    });

    expect(assessExternalUrl(" HTTPS://Creator.Example/source ")).toEqual({
      raw: "HTTPS://Creator.Example/source",
      normalized: "https://creator.example/source",
      href: "https://creator.example/source",
      status: "valid",
    });
  });

  it("turns intake fields into source, output, and platform evidence cards", () => {
    const bundle = buildEvidenceBundlePreview({
      title: "Voice clone dispute",
      sourceUrl: "https://creator.example/source",
      aiOutputUrl: "https://platform.example/output",
      platformUrl: "https://platform.example/post",
      notes: "Suspicious synthetic voice reuse",
    });

    expect(bundle.map((item) => item.type)).toEqual(["source", "output", "platform"]);
    expect(bundle[0].url).toContain("creator.example");
  });

  it("trims title, urls, and notes before building the preview", () => {
    const bundle = buildEvidenceBundlePreview({
      title: "  Voice clone dispute  ",
      sourceUrl: "  https://creator.example/source  ",
      aiOutputUrl: "  https://platform.example/output  ",
      platformUrl: "  https://platform.example/post  ",
      notes: "  Suspicious synthetic voice reuse  ",
    });

    expect(bundle).toMatchObject([
      {
        title: "Voice clone dispute source record",
        url: "https://creator.example/source",
        description: "Original creator source gathered for Voice clone dispute. Suspicious synthetic voice reuse",
      },
      {
        title: "Voice clone dispute AI output",
        url: "https://platform.example/output",
        description: "AI-generated output gathered for Voice clone dispute. Suspicious synthetic voice reuse",
      },
      {
        title: "Voice clone dispute platform listing",
        url: "https://platform.example/post",
        description: "Platform listing gathered for Voice clone dispute. Suspicious synthetic voice reuse",
      },
    ]);
  });

  it("returns a deterministic preview structure for the same submission", () => {
    const submission = {
      title: "Voice clone dispute",
      sourceUrl: "https://creator.example/source",
      aiOutputUrl: "https://platform.example/output",
      platformUrl: "https://platform.example/post",
      notes: "Suspicious synthetic voice reuse",
    };

    expect(buildEvidenceBundlePreview(submission)).toEqual([
      {
        id: "voice-clone-dispute-source",
        type: "source",
        title: "Voice clone dispute source record",
        url: "https://creator.example/source",
        previewUrlText: undefined,
        description: "Original creator source gathered for Voice clone dispute. Suspicious synthetic voice reuse",
        capturedAt: "voice-clone-dispute-source-captured",
      },
      {
        id: "voice-clone-dispute-output",
        type: "output",
        title: "Voice clone dispute AI output",
        url: "https://platform.example/output",
        previewUrlText: undefined,
        description: "AI-generated output gathered for Voice clone dispute. Suspicious synthetic voice reuse",
        capturedAt: "voice-clone-dispute-output-captured",
      },
      {
        id: "voice-clone-dispute-platform",
        type: "platform",
        title: "Voice clone dispute platform listing",
        url: "https://platform.example/post",
        previewUrlText: undefined,
        description: "Platform listing gathered for Voice clone dispute. Suspicious synthetic voice reuse",
        capturedAt: "voice-clone-dispute-platform-captured",
      },
    ]);
  });

  it("clears disallowed url schemes from the evidence preview url fields", () => {
    const bundle = buildEvidenceBundlePreview({
      title: "Voice clone dispute",
      sourceUrl: " javascript:alert(1) ",
      aiOutputUrl: "data:text/html,boom",
      platformUrl: "mailto:review@example.com",
      notes: "Suspicious synthetic voice reuse",
    });

    expect(bundle).toMatchObject([
      {
        url: "",
        previewUrlText: "javascript:alert(1)",
      },
      {
        url: "",
        previewUrlText: "data:text/html,boom",
      },
      {
        url: "",
        previewUrlText: "mailto:review@example.com",
      },
    ]);
  });

  it("preserves normalized http and https urls in the preview", () => {
    const bundle = buildEvidenceBundlePreview({
      title: "Voice clone dispute",
      sourceUrl: "  HTTPS://Creator.Example/source  ",
      aiOutputUrl: "http://platform.example/output",
      platformUrl: " https://platform.example/post#fragment ",
      notes: "Suspicious synthetic voice reuse",
    });

    expect(bundle).toMatchObject([
      {
        url: "https://creator.example/source",
      },
      {
        url: "http://platform.example/output",
      },
      {
        url: "https://platform.example/post#fragment",
      },
    ]);
    expect(bundle[0]).not.toHaveProperty("previewUrlText");
    expect(bundle[1]).not.toHaveProperty("previewUrlText");
    expect(bundle[2]).not.toHaveProperty("previewUrlText");
  });
});
