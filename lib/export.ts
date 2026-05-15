import type { VerdictReceipt } from "@/lib/domain";

function slugifyForFilename(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "receipt";
}

export function receiptToJson(receipt: VerdictReceipt): string {
  return JSON.stringify(receipt, null, 2);
}

export function receiptDownloadFilename(receipt: VerdictReceipt): string {
  return `consentvault-${slugifyForFilename(receipt.caseId)}-${slugifyForFilename(receipt.finalVerdict)}.json`;
}

export function downloadReceiptJson(receipt: VerdictReceipt) {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    typeof Blob === "undefined" ||
    typeof window.URL?.createObjectURL !== "function"
  ) {
    throw new Error("JSON download is unavailable in this environment.");
  }

  const blob = new Blob([receiptToJson(receipt)], { type: "application/json" });
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = receiptDownloadFilename(receipt);
  anchor.rel = "noopener";

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(objectUrl);
}

export async function copyReceiptJsonToClipboard(receipt: VerdictReceipt) {
  if (typeof navigator === "undefined" || typeof navigator.clipboard?.writeText !== "function") {
    throw new Error("Clipboard sharing is unavailable in this browser.");
  }

  await navigator.clipboard.writeText(receiptToJson(receipt));
}
