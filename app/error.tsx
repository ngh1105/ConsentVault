"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

type ErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[consentvault] route error:", error);
    }
  }, [error]);

  return (
    <section
      className="evidence-card mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 py-8 sm:px-8 sm:py-10"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-wrap items-center gap-3">
        <p className="metadata-label">Archive interruption</p>
        <span className="inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-destructive">
          <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
          Unexpected error
        </span>
      </div>

      <div className="space-y-4">
        <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
          The current ConsentVault view stalled before it could finish rendering.
        </h1>
        <p className="text-sm leading-7 text-muted-foreground sm:text-base">
          Try the recovery action below to remount this section. If the issue
          persists, return to the dashboard and reopen the case from the ledger.
        </p>
        {error?.message ? (
          <p className="rounded-[1.2rem] border border-destructive/30 bg-destructive/8 p-4 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-destructive">
            {error.message}
            {error.digest ? <span className="ml-2 opacity-70">[{error.digest}]</span> : null}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 py-3 text-center font-mono text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md"
        >
          Retry rendering this view
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink/10 bg-card/70 px-5 py-3 text-center font-mono text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition hover:border-accent/20 hover:bg-accent/8"
        >
          Back to dashboard
        </Link>
      </div>
    </section>
  );
}
