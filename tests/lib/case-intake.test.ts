import { describe, expect, it } from "vitest";
import { buildEvidenceBundlePreview } from "@/lib/case-intake";

describe("buildEvidenceBundlePreview", () => {
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
        description: "Original creator source gathered for Voice clone dispute. Suspicious synthetic voice reuse",
        capturedAt: "voice-clone-dispute-source-captured",
      },
      {
        id: "voice-clone-dispute-output",
        type: "output",
        title: "Voice clone dispute AI output",
        url: "https://platform.example/output",
        description: "AI-generated output gathered for Voice clone dispute. Suspicious synthetic voice reuse",
        capturedAt: "voice-clone-dispute-output-captured",
      },
      {
        id: "voice-clone-dispute-platform",
        type: "platform",
        title: "Voice clone dispute platform listing",
        url: "https://platform.example/post",
        description: "Platform listing gathered for Voice clone dispute. Suspicious synthetic voice reuse",
        capturedAt: "voice-clone-dispute-platform-captured",
      },
    ]);
  });
});
