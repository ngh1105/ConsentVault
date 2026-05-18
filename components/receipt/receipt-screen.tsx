"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, FileX2, Sparkles } from "lucide-react";
import { useConsentVault } from "@/components/providers/consent-vault-provider";
import { VerdictBanner } from "@/components/ui/verdict-banner";

type ReceiptScreenProps = {
  caseId: string;
};

function MissingState({ title, description }: { title: string; description: string }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Receipt unavailable</p>
      <h1 className="mt-3 text-2xl font-semibold text-foreground">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      <Link
        href="/"
        className="mt-4 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90"
      >
        Back to dashboard
      </Link>
    </section>
  );
}

export function ReceiptScreen({ caseId }: ReceiptScreenProps) {
  const { getCaseById, getPolicyById, getReceiptByCaseId } = useConsentVault();
  const consentCase = getCaseById(caseId);

  if (!consentCase) {
    return (
      <MissingState
        title="No receipt record exists for this case."
        description="Return to the dashboard and open a seeded dispute before entering the receipt route."
      />
    );
  }

  const policy = getPolicyById(consentCase.policyId);

  if (!policy) {
    return (
      <MissingState
        title="The linked creator policy could not be loaded."
        description="A receipt needs the archived policy context before the verdict can be reviewed or exported."
      />
    );
  }

  const receipt = getReceiptByCaseId(consentCase.id);

  if (!receipt) {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Receipt pending
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
            Generate a verdict receipt for {consentCase.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            This case has archive context and policy linkage, but it still needs a trial run before a shareable receipt can be produced.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card-elevated p-5">
              <div className="flex items-center gap-3">
                <FileX2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-foreground">No receipt on file</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Open the mock trial route to generate deterministic validator judgments and save the final verdict into the archive.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/cases/${consentCase.id}/trial`}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90"
                >
                  Run mock trial
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href={`/cases/${consentCase.id}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-card-elevated"
                >
                  Return to case
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card-elevated p-5">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Receipt workflow
              </p>
              <p className="mt-3 text-lg font-semibold text-foreground">Trial first, receipt second.</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Once the simulated validators agree on a verdict, this route becomes the final archive card and export surface.
              </p>
              <Link
                href={`/cases/${consentCase.id}/trial`}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-card-elevated"
              >
                Open trial page
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/cases/${consentCase.id}`}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-card-elevated"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to case overview
        </Link>
        <Link
          href={`/cases/${consentCase.id}/trial`}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-card-elevated"
        >
          Revisit trial
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <VerdictBanner
        verdict={receipt.finalVerdict}
        score={receipt.score}
        caseTitle={consentCase.title}
      />

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Receipt metadata</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Receipt ID
            </dt>
            <dd className="mt-1 text-sm text-foreground">{receipt.id}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Case ID
            </dt>
            <dd className="mt-1 text-sm text-foreground">{receipt.caseId}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Final verdict
            </dt>
            <dd className="mt-1 text-sm text-foreground">{receipt.finalVerdict}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Consensus score
            </dt>
            <dd className="mt-1 text-sm text-foreground">{receipt.score} / 100</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Judgments
            </dt>
            <dd className="mt-1 text-sm text-foreground">{receipt.judgments.length} validators</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Issued at
            </dt>
            <dd className="mt-1 text-sm text-foreground">{receipt.createdAt}</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Policy
            </dt>
            <dd className="mt-1 text-sm text-foreground">{policy.creatorName} ({policy.creatorHandle})</dd>
          </div>
          <div>
            <dt className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Recommended action
            </dt>
            <dd className="mt-1 text-sm text-foreground">{receipt.recommendedAction}</dd>
          </div>
          {receipt.wallet && (
            <div>
              <dt className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                GenLayer issuer
              </dt>
              <dd className="mt-1 text-sm text-foreground break-all">{receipt.wallet.issuerAddress}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">{receipt.summary}</p>
      </section>

      <details className="rounded-2xl border border-border bg-card">
        <summary className="cursor-pointer px-6 py-4 text-sm font-medium text-foreground hover:bg-card-elevated transition rounded-2xl">
          Export receipt as JSON
        </summary>
        <pre className="overflow-x-auto border-t border-border px-6 py-4 font-mono text-xs text-foreground">
          {JSON.stringify(receipt, null, 2)}
        </pre>
      </details>
    </div>
  );
}
