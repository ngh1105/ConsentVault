"use client";

import Link from "next/link";
import { useConsentVault } from "@/components/providers/consent-vault-provider";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { assessExternalUrl } from "@/lib/case-intake";
import { matchPolicyClauses } from "@/lib/evidence";
import { ComparisonPanel } from "@/components/evidence/comparison-panel";
import { EvidenceTimeline } from "@/components/evidence/evidence-timeline";
import { PolicyClauseList } from "@/components/evidence/policy-clause-list";

type EvidenceWorkspaceScreenProps = {
  caseId: string;
};

export function EvidenceWorkspaceScreen({ caseId }: EvidenceWorkspaceScreenProps) {
  const { getCaseById, getPolicyById, getReceiptByCaseId } = useConsentVault();
  const consentCase = getCaseById(caseId);

  if (!consentCase) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-10">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Case not found</h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          Return to the docket and reopen one of the seeded disputes before entering the evidence review route.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-[hsl(350_80%_44%)] px-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-white"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const policy = getPolicyById(consentCase.policyId);
  const _receipt = getReceiptByCaseId(consentCase.id);
  const matchedClauses = policy ? matchPolicyClauses(consentCase, policy) : [];
  const items = consentCase.evidenceItems;

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-10 space-y-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{consentCase.title}</h1>
        <Badge variant="neutral">{items.length}</Badge>
      </div>

      {/* Drop zone */}
      <div
        className="rounded-2xl border border-dashed border-border-strong bg-card/40 px-6 py-16 text-center"
      >
        <p className="text-sm text-muted-foreground">
          Evidence items are linked automatically from the case intake. Review them below.
        </p>
      </div>

      {/* Evidence grid or empty state */}
      {items.length === 0 ? (
        <EmptyState headline="No evidence linked yet" description="Add at least one source or output." />
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {items.map((ev) => (
            <li key={ev.id} className="rounded-2xl border border-border bg-card p-5">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{ev.id}</p>
              <Badge variant="neutral" className="mt-2">{ev.type}</Badge>
              <h3 className="mt-3 text-base font-semibold text-foreground">{ev.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{ev.description}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Comparison panel */}
      <ComparisonPanel consentCase={consentCase} />

      {/* Policy clauses + metadata */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <PolicyClauseList policy={policy} matchedClauses={matchedClauses} consentCase={consentCase} />

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-6">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Source registry</p>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                { label: "Source URL", url: consentCase.sourceUrl },
                { label: "AI output URL", url: consentCase.aiOutputUrl },
                { label: "Platform URL", url: consentCase.platformUrl },
              ].map(({ label, url }) => {
                const assessment = assessExternalUrl(url);
                return (
                  <div key={label} className="rounded-xl border border-border bg-background p-4">
                    <dt className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
                    <dd className="mt-2 text-sm text-foreground">
                      {assessment.status === "valid" ? (
                        <a
                          href={assessment.href}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-foreground underline decoration-accent underline-offset-4 hover:decoration-accent"
                        >
                          {assessment.normalized}
                        </a>
                      ) : (
                        <span className="break-all">{url || "No archived URL"}</span>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Internal note</p>
            <p className="mt-4 text-sm leading-7 text-foreground">{consentCase.notes}</p>
          </section>

          <Link
            href={`/cases/${consentCase.id}`}
            className="inline-flex h-11 items-center rounded-full border border-border bg-card px-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-card-elevated"
          >
            Back to case overview
          </Link>
        </aside>
      </div>

      {/* Evidence timeline */}
      <EvidenceTimeline evidenceItems={consentCase.evidenceItems} />
    </div>
  );
}
