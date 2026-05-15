"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, FileX2, Sparkles } from "lucide-react";
import { useConsentVault } from "@/components/providers/consent-vault-provider";
import { ReceiptCard } from "@/components/receipt/receipt-card";
import { ShareActions } from "@/components/receipt/share-actions";

type ReceiptScreenProps = {
  caseId: string;
};

function MissingState({ title, description }: { title: string; description: string }) {
  return (
    <section className="evidence-card p-6 sm:p-8">
      <p className="metadata-label">Receipt unavailable</p>
      <h1 className="mt-5 font-display text-4xl font-semibold">{title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground"
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
        <section className="evidence-card p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="metadata-label">Receipt pending</p>
              <h1 className="mt-5 font-display text-4xl font-semibold text-balance sm:text-5xl">
                Generate a verdict receipt for {consentCase.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
                This case has archive context and policy linkage, but it still needs a trial run before a shareable receipt can be produced.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/80 bg-background/70 px-5 py-4 text-right">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                Current status
              </p>
              <p className="mt-3 font-display text-3xl">{consentCase.status}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <section className="rounded-[1.7rem] border border-border/80 bg-background/70 p-5">
              <div className="flex items-center gap-3">
                <FileX2 className="h-5 w-5 text-accent" aria-hidden="true" />
                <h2 className="font-display text-3xl font-semibold">No receipt on file</h2>
              </div>
              <p className="mt-4 text-sm leading-7 text-foreground">
                Open the mock trial route to generate deterministic validator judgments and save the final verdict into the archive.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/cases/${consentCase.id}/trial`}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground transition hover:translate-y-[-1px] hover:shadow-md"
                >
                  Run mock trial
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href={`/cases/${consentCase.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-card/70 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition hover:border-accent/20 hover:bg-accent/8"
                >
                  Return to case
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </section>

            <section className="verdict-banner p-6 text-accent-foreground">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-accent-foreground/80">
                Receipt workflow
              </p>
              <p className="mt-4 font-display text-3xl font-semibold">Trial first, receipt second.</p>
              <p className="mt-3 text-sm leading-6 text-accent-foreground/85">
                Once the simulated validators agree on a verdict, this route becomes the final archive card and export surface.
              </p>
              <Link
                href={`/cases/${consentCase.id}/trial`}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground transition hover:bg-white/8"
              >
                Open trial page
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </section>
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
          className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-card/70 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition hover:border-accent/20 hover:bg-accent/8"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to case overview
        </Link>
        <Link
          href={`/cases/${consentCase.id}/trial`}
          className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-card/70 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition hover:border-accent/20 hover:bg-accent/8"
        >
          Revisit trial
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <ReceiptCard consentCase={consentCase} policy={policy} receipt={receipt} />
      <ShareActions receipt={receipt} />
    </div>
  );
}
