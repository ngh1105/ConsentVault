"use client";

import Link from "next/link";
import { ArrowRight, FolderKanban, Landmark, Scale, ShieldCheck } from "lucide-react";
import { useConsentVault } from "@/components/providers/consent-vault-provider";
import { CaseCard } from "./case-card";

export function DashboardScreen() {
  const { cases, policies, receipts, getPolicyById, getReceiptByCaseId } = useConsentVault();

  const verdictReadyCount = cases.filter((consentCase) => consentCase.status === "Verdict Ready").length;
  const visibleCases = cases.slice(0, 3);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(19rem,0.85fr)]">
        <article className="evidence-card overflow-hidden p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="metadata-label">Dashboard</span>
            <span className="rounded-full border border-border/80 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
              case workflow
            </span>
          </div>
          <h2 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
            Review creator policies, inspect disputes, and move the docket toward a receipt.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            ConsentVault keeps the active archive in one place: every case links back to the creator policy, evidence count, and the latest tribunal signal.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/cases/new"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md"
            >
              Create case
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href={cases[0] ? `/cases/${cases[0].id}` : "/"}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/10 bg-card/70 px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition hover:border-accent/20 hover:bg-accent/8"
            >
              Review latest case
            </Link>
          </div>
        </article>

        <aside className="space-y-4">
          <section className="verdict-banner p-6 text-accent-foreground">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-accent-foreground/80">
              Active tribunal signal
            </p>
            <h3 className="mt-3 font-display text-3xl font-semibold">{verdictReadyCount} cases verdict-ready</h3>
            <p className="mt-3 text-sm leading-6 text-accent-foreground/85">
              Cases with generated receipts can move directly into evidence review, trial replay, or export in later tasks.
            </p>
          </section>

          <section className="evidence-card p-6">
            <p className="metadata-label">Archive totals</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[1.35rem] border border-border/80 bg-background/65 p-4">
                <div className="flex items-center gap-2 text-accent">
                  <FolderKanban className="h-4 w-4" aria-hidden="true" />
                  <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">Cases</span>
                </div>
                <p className="mt-3 font-display text-3xl">{cases.length}</p>
              </div>
              <div className="rounded-[1.35rem] border border-border/80 bg-background/65 p-4">
                <div className="flex items-center gap-2 text-accent">
                  <Landmark className="h-4 w-4" aria-hidden="true" />
                  <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">Policies</span>
                </div>
                <p className="mt-3 font-display text-3xl">{policies.length}</p>
              </div>
              <div className="rounded-[1.35rem] border border-border/80 bg-background/65 p-4">
                <div className="flex items-center gap-2 text-accent">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">Receipts</span>
                </div>
                <p className="mt-3 font-display text-3xl">{receipts.length}</p>
              </div>
            </div>
          </section>
        </aside>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="metadata-label">Case ledger</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">Live dispute archive</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            The dashboard surfaces a curated set of active sample cases while preserving archive totals and verdict confidence at a glance.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {visibleCases.map((consentCase) => {
            const policy = getPolicyById(consentCase.policyId);
            if (!policy) {
              return null;
            }

            return (
              <CaseCard
                key={consentCase.id}
                consentCase={consentCase}
                policy={policy}
                receipt={getReceiptByCaseId(consentCase.id)}
              />
            );
          })}
        </div>
      </section>

      <section className="evidence-card p-6 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="metadata-label">Workflow</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">From policy to verdict</h2>
          </div>
          <Scale className="h-6 w-6 text-accent" aria-hidden="true" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            "Capture creator consent rules and blocked uses.",
            "Compare source, output, and platform evidence inside each case.",
            "Advance finished disputes into a receipt-backed verdict.",
          ].map((step, index) => (
            <div key={step} className="rounded-[1.45rem] border border-border/80 bg-background/70 p-5">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-accent">0{index + 1}</p>
              <p className="mt-3 text-sm leading-6 text-foreground">{step}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
