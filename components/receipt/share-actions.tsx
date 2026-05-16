"use client";

import { CheckCircle2, ClipboardCopy, Download, LoaderCircle, TriangleAlert } from "lucide-react";
import * as React from "react";
import type { VerdictReceipt } from "@/lib/domain";
import { copyReceiptJsonToClipboard, downloadReceiptJson } from "@/lib/export";

type ShareActionsProps = {
  receipt: VerdictReceipt;
};

type ActionState =
  | { tone: "idle"; message: string }
  | { tone: "success"; message: string }
  | { tone: "error"; message: string };

const defaultState: ActionState = {
  tone: "idle",
  message: "Download the JSON archive or copy the receipt payload for platform escalation notes.",
};

function isClipboardAvailable() {
  return typeof navigator !== "undefined" && typeof navigator.clipboard?.writeText === "function";
}

function isDownloadAvailable() {
  return (
    typeof window !== "undefined" &&
    typeof document !== "undefined" &&
    typeof Blob !== "undefined" &&
    typeof window.URL?.createObjectURL === "function"
  );
}

type BrowserCapabilities = {
  clipboard: boolean;
  download: boolean;
};

const unavailableCapabilities: BrowserCapabilities = {
  clipboard: false,
  download: false,
};

function getBrowserCapabilities(): BrowserCapabilities {
  return {
    clipboard: isClipboardAvailable(),
    download: isDownloadAvailable(),
  };
}

export function ShareActions({ receipt }: ShareActionsProps) {
  const [actionState, setActionState] = React.useState<ActionState>(defaultState);
  const [isCopying, setIsCopying] = React.useState(false);
  const [capabilities, setCapabilities] = React.useState<BrowserCapabilities>(unavailableCapabilities);

  React.useEffect(() => {
    setCapabilities(getBrowserCapabilities());
  }, []);
  async function handleCopy() {
    setIsCopying(true);

    try {
      await copyReceiptJsonToClipboard(receipt);
      setActionState({ tone: "success", message: "Receipt JSON copied to your clipboard." });
    } catch (error) {
      setActionState({
        tone: "error",
        message: error instanceof Error ? error.message : "Clipboard sharing failed.",
      });
    } finally {
      setIsCopying(false);
    }
  }

  function handleDownload() {
    try {
      downloadReceiptJson(receipt);
      setActionState({ tone: "success", message: "Receipt JSON download started." });
    } catch (error) {
      setActionState({
        tone: "error",
        message: error instanceof Error ? error.message : "Receipt download failed.",
      });
    }
  }

  return (
    <section className="evidence-card p-6 sm:p-7" aria-labelledby="share-actions-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="metadata-label">Export and share</p>
          <h2 id="share-actions-title" className="mt-4 font-display text-3xl font-semibold">
            Receipt handoff actions
          </h2>
        </div>
        <div className="rounded-full border border-border/80 bg-background/70 px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
          Browser-safe helpers
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={!capabilities.download}
          aria-label="Download receipt JSON"
          className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-border/80 bg-background/70 px-5 py-4 text-left transition hover:border-accent/20 hover:bg-accent/6 disabled:cursor-not-allowed disabled:opacity-55"
        >
          <div>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
              JSON export
            </p>
            <p className="mt-2 font-display text-2xl">Download archive copy</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Save the receipt as a portable evidence attachment.
            </p>
          </div>
          <Download className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => {
            void handleCopy();
          }}
          disabled={!capabilities.clipboard || isCopying}
          aria-label="Copy receipt JSON to clipboard"
          className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-border/80 bg-background/70 px-5 py-4 text-left transition hover:border-accent/20 hover:bg-accent/6 disabled:cursor-not-allowed disabled:opacity-55"
        >
          <div>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
              Clipboard share
            </p>
            <p className="mt-2 font-display text-2xl">
              {isCopying ? "Copying receipt" : "Copy JSON payload"}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Paste the verdict payload into case notes, tickets, or moderation reports.
            </p>
          </div>
          {isCopying ? (
            <LoaderCircle className="h-5 w-5 shrink-0 animate-spin text-accent" aria-hidden="true" />
          ) : (
            <ClipboardCopy className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        className="mt-5 rounded-[1.4rem] border border-border/75 bg-card/75 px-4 py-3"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          {actionState.tone === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          ) : actionState.tone === "error" ? (
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          ) : (
            <ClipboardCopy className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
          <p className="text-sm leading-6 text-foreground">{actionState.message}</p>
        </div>
        {!capabilities.download || !capabilities.clipboard ? (
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Some browser APIs are unavailable here, so one or more share actions are disabled.
          </p>
        ) : null}
      </div>
    </section>
  );
}
