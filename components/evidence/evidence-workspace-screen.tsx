"use client";

import Link from "next/link";
import { ArrowLeft, Clock3, Landmark, Scale, ShieldAlert } from "lucide-react";
import { ComparisonPanel } from "@/components/evidence/comparison-panel";
import { EvidenceTimeline } from "@/components/evidence/evidence-timeline";
import { PolicyClauseList } from "@/components/evidence/policy-clause-list";
import { useConsentVault } from "@/components/providers/consent-vault-provider";
import { assessExternalUrl } from "@/lib/case-intake";
import { matchPolicyClauses } from "@/lib/evidence";

type EvidenceWorkspaceScreenProps = {
  caseId: string;
};

function MetadataLink({ label, url }: { label: string; url: string }) {
  const assessment = assessExternalUrl(url);

  return (
    <div className="rounded-[1.3rem] border border-border/80 bg-background/70 p-4">
      <dt className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">{label}</dt>
      <dd className="mt-2 text-sm leading-6 text-foreground">
        {assessment.status === "valid" ? (
          <a
            href={assessment.href}
            target="_blank"
            rel="noreferrer"
            className="break-all text-accent underline decoration-accent/30 underline-offset-4 transition hover:decoration-accent"
          >
            {assessment.normalized}
          </a>
        ) : (
          <span className="break-all">{url || "No archived URL"}</span>
        )}
      </dd>
    </div>
  );
}

export function EvidenceWorkspaceScreen({ caseId }: EvidenceWorkspaceScreenProps) {
  const { getCaseById, getPolicyById, getReceiptByCaseId } = useConsentVault();
  const consentCase = getCaseById(caseId);

  if (!consentCase) {
    return (
      <section className="evidence-card p-6 sm:p-8">
        <p className="metadata-label">Case not found</p>
        <h1 className="mt-5 font-display text-4xl font-semibold">No evidence workspace exists for this archive record.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          Return to the docket and reopen one of the seeded disputes before entering the evidence review route.
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
  const matchedClauses = policy ? matchPolicyClauses(consentCase, policy) : [];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.9fr)]">
        <article className="evidence-card overflow-hidden p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="metadata-label">Evidence workspace</span>
            <span className="rounded-full border border-ink/10 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
              legal archive review
            </span>
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
            {consentCase.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            {consentCase.notes}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.4rem] border border-border/80 bg-background/70 p-5">
              <div className="flex items-center gap-2 text-accent">
                <Landmark className="h-4 w-4" aria-hidden="true" />
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">Linked policy</span>
              </div>
              <p className="mt-3 font-display text-2xl">{policy?.creatorName ?? "Policy missing"}</p>
              <p className="text-sm text-muted-foreground">{policy?.creatorHandle ?? consentCase.policyId}</p>
            </div>
            <div className="rounded-[1.4rem] border border-border/80 bg-background/70 p-5">
              <div className="flex items-center gap-2 text-accent">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">Blocked matches</span>
              </div>
              <p className="mt-3 font-display text-3xl">{matchedClauses.length}</p>
              <p className="text-sm text-muted-foreground">Applicable blocked clauses surfaced in the current archive file.</p>
            </div>
            <div className="rounded-[1.4rem] border border-border/80 bg-background/70 p-5">
              <div className="flex items-center gap-2 text-accent">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">Evidence items</span>
              </div>
              <p className="mt-3 font-display text-3xl">{consentCase.evidenceItems.length}</p>
              <p className="text-sm text-muted-foreground">Source, output, platform, and note records preserved in this route.</p>
            </div>
          </div>
        </article>

        <aside className="space-y-4">
          <section className="verdict-banner p-6 text-accent-foreground">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-accent-foreground/80">
              Route handoff
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold">
              {receipt?.finalVerdict ?? "Awaiting receipt"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-accent-foreground/85">
              {receipt
                ? `${Math.round(receipt.score * 100)}% confidence. ${receipt.summary}`
                : "No verdict receipt is attached yet, so the evidence file remains the primary review surface."}
            </p>
          </section>

          <section className="evidence-card p-6">
            <div className="flex items-center gap-3">
              <Scale className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="font-display text-3xl font-semibold">Case ledger</h2>
            </div>
            <dl className="mt-5 space-y-4 text-sm leading-6">
              <div>
                <dt className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  Case status
                </dt>
                <dd className="mt-1 text-foreground">{consentCase.status}</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  Created at
                </dt>
                <dd className="mt-1 break-all text-foreground">{consentCase.createdAt}</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  Verdict action
                </dt>
                <dd className="mt-1 text-foreground">
                  {receipt?.recommendedAction ?? "Continue gathering evidence before escalating the dispute."}
                </dd>
              </div>
            </dl>
          </section>

          <Link
            href={`/cases/${consentCase.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-card/70 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition hover:border-accent/20 hover:bg-accent/8"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to case overview
          </Link>
        </aside>
      </section>

      <ComparisonPanel consentCase={consentCase} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <PolicyClauseList policy={policy} matchedClauses={matchedClauses} consentCase={consentCase} />

        <aside className="space-y-4">
          <section className="evidence-card p-6">
            <p className="metadata-label">Source registry</p>
            <h2 className="mt-4 font-display text-3xl font-semibold">URLs and notes</h2>
            <dl className="mt-5 space-y-3 text-sm leading-6">
              <MetadataLink label="Source URL" url={consentCase.sourceUrl} />
              <MetadataLink label="AI output URL" url={consentCase.aiOutputUrl} />
              <MetadataLink label="Platform URL" url={consentCase.platformUrl} />
            </dl>
          </section>

          <section className="evidence-card p-6">
            <p className="metadata-label">Internal note</p>
            <h2 className="mt-4 font-display text-3xl font-semibold">Investigator summary</h2>
            <p className="mt-4 text-sm leading-7 text-foreground">{consentCase.notes}</p>
          </section>
        </aside>
      </section>

      <EvidenceTimeline evidenceItems={consentCase.evidenceItems} />
    </div>
  );
}
