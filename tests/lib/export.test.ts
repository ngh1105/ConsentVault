import { describe, expect, it } from "vitest";
import { receiptDownloadFilename, receiptToJson } from "@/lib/export";
import { sampleReceipt } from "@/lib/sample-data";

describe("receiptToJson", () => {
  it("serializes a verdict receipt with stable indentation", () => {
    expect(receiptToJson(sampleReceipt)).toContain('"finalVerdict": "Violation"');
    expect(receiptToJson(sampleReceipt)).toContain('\n  "caseId":');
  });

  it("round-trips the receipt payload through JSON parsing", () => {
    expect(JSON.parse(receiptToJson(sampleReceipt))).toEqual(sampleReceipt);
  });
});

describe("receiptDownloadFilename", () => {
  it("includes a sanitized case id and verdict in the exported filename", () => {
    expect(
      receiptDownloadFilename({
        ...sampleReceipt,
        caseId: "Case / 17",
        finalVerdict: "Needs Attribution",
      }),
    ).toBe("consentvault-case-17-needs-attribution.json");
  });
});
