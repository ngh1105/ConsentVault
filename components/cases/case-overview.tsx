"use client";

import Link from "next/link";
import { ArrowUpRight, FileSearch, Landmark, ScrollText } from "lucide-react";
import { useConsentVault } from "@/components/providers/consent-vault-provider";
import { StatusPill } from "@/components/dashboard/status-pill";
import { formatConfidence } from "@/lib/verdict";

type CaseOverviewProps = {
  caseId: string;
};

export function CaseOverview({ caseId }: CaseOverviewProps) {
  const { getCaseById, getPolicyById, getReceiptByCaseId } = useConsentVault();

  const consentCase = getCaseById(caseId);

  if (!consentCase) {
    return (
      <section className="evidence-card p-6 sm:p-8">
        <p className="metadata-label">Case not found</p>
        <h1 className="mt-5 font-display text-4xl font-semibold">No archive record matches this case.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          Return to the dashboard to open one of the seeded disputes or create a new case in a later task.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground"
        >
          Back to dashboard
        </Link>
      </section>
    );
  }

  const policy = getPolicyById(consentCase.policyId);
  const receipt = getReceiptByCaseId(consentCase.id);

  return (
    <div className="space-y-6">
      <section className="evidence-card p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="metadata-label">Case overview</p>
            <h1 className="mt-4 font-display text-4xl font-semibold text-balance sm:text-5xl">
              {consentCase.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              {consentCase.notes}
            </p>
          </div>
          <StatusPill status={consentCase.status} className="mt-1" />
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[1.5rem] border border-border/80 bg-background/70 p-5">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
              Creator policy
            </p>
            <p className="mt-3 font-display text-2xl">{policy?.creatorName ?? "Unknown creator"}</p>
            <p className="text-sm text-muted-foreground">{policy?.creatorHandle ?? consentCase.policyId}</p>
          </div>
          <div className="rounded-[1.5rem] border border-border/80 bg-background/70 p-5">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
              Evidence count
            </p>
            <p className="mt-3 font-display text-3xl">{consentCase.evidenceItems.length}</p>
            <p className="text-sm text-muted-foreground">Source, output, and policy records in this file.</p>
          </div>
          <div className="rounded-[1.5rem] border border-border/80 bg-background/70 p-5">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
              Verdict signal
            </p>
            <p className="mt-3 font-display text-2xl leading-tight">
              {receipt?.finalVerdict ?? "Pending receipt"}
            </p>
            <p className="text-sm text-muted-foreground">
              {receipt ? formatConfidence(receipt.score) : "No verdict receipt generated yet."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <article className="evidence-card p-6">
          <div className="flex items-center gap-3">
            <Landmark className="h-5 w-5 text-accent" aria-hidden="true" />
            <h2 className="font-display text-3xl font-semibold">Policy summary</h2>
          </div>
          {policy ? (
            <div className="mt-5 space-y-5">
              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  Allowed uses
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground">
                  {policy.allowedUses.map((item) => (
                    <li key={item} className="rounded-[1.1rem] border border-border/70 bg-background/65 px-4 py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  Blocked uses
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground">
                  {policy.blockedUses.map((item) => (
                    <li key={item} className="rounded-[1.1rem] border border-accent/15 bg-accent/6 px-4 py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[1.2rem] border border-border/70 bg-background/65 p-4">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                    Attribution
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{policy.attributionRules}</p>
                </div>
                <div className="rounded-[1.2rem] border border-border/70 bg-background/65 p-4">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                    License rule
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{policy.licenseRules}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              The linked policy could not be loaded for this case.
            </p>
          )}
        </article>

        <aside className="space-y-4">
          <section className="evidence-card p-6">
            <div className="flex items-center gap-3">
              <ScrollText className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="font-display text-3xl font-semibold">Case metadata</h2>
            </div>
            <dl className="mt-5 space-y-4 text-sm leading-6">
              <div>
                <dt className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  Source URL
                </dt>
                <dd className="mt-1 break-all text-foreground">{consentCase.sourceUrl}</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  AI output URL
                </dt>
                <dd className="mt-1 break-all text-foreground">{consentCase.aiOutputUrl}</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  Platform URL
                </dt>
                <dd className="mt-1 break-all text-foreground">{consentCase.platformUrl}</dd>
              </div>
            </dl>
          </section>

          <section className="evidence-card p-6">
            <div className="flex items-center gap-3">
              <FileSearch className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="font-display text-3xl font-semibold">Open route</h2>
            </div>
            <div className="mt-5 space-y-3">
              <Link
                href={`/cases/${consentCase.id}/evidence`}
                className="flex items-center justify-between rounded-[1.2rem] border border-border/80 bg-background/65 px-4 py-3 text-sm text-foreground transition hover:border-accent/20 hover:bg-accent/6"
              >
                Evidence workspace
                <ArrowUpRight className="h-4 w-4 text-accent" aria-hidden="true" />
              </Link>
              <Link
                href={`/cases/${consentCase.id}/trial`}
                className="flex items-center justify-between rounded-[1.2rem] border border-border/80 bg-background/65 px-4 py-3 text-sm text-foreground transition hover:border-accent/20 hover:bg-accent/6"
              >
                Trial view
                <ArrowUpRight className="h-4 w-4 text-accent" aria-hidden="true" />
              </Link>
              <Link
                href={`/cases/${consentCase.id}/receipt`}
                className="flex items-center justify-between rounded-[1.2rem] border border-border/80 bg-background/65 px-4 py-3 text-sm text-foreground transition hover:border-accent/20 hover:bg-accent/6"
              >
                Receipt view
                <ArrowUpRight className="h-4 w-4 text-accent" aria-hidden="true" />
              </Link>
            </div>
            {receipt ? (
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{receipt.summary}</p>
            ) : null}
          </section>

          <section className="verdict-banner p-6 text-accent-foreground">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-accent-foreground/80">
              Recommended action
            </p>
            <p className="mt-3 text-sm leading-6 text-accent-foreground/90">
              {receipt?.recommendedAction ?? "Continue building the case record before escalating the dispute."}
            </p>
          </section>
        </aside>
      </section>
    </div>
  );
}
