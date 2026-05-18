"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useConsentVault } from "@/components/providers/consent-vault-provider";
import { Badge } from "@/components/ui/badge";
import { formatConfidence } from "@/lib/verdict";

type CaseOverviewProps = {
  caseId: string;
};

export function CaseOverview({ caseId }: CaseOverviewProps) {
  const { getCaseById, getPolicyById, getReceiptByCaseId } = useConsentVault();

  const consentCase = getCaseById(caseId);

  if (!consentCase) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-10">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Case not found</h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          Return to the dashboard to open one of the seeded disputes or create a fresh case from the intake desk.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-accent px-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const policy = getPolicyById(consentCase.policyId);
  const receipt = getReceiptByCaseId(consentCase.id);

  const timeline = [
    {
      id: "created",
      timestamp: consentCase.createdAt,
      label: "Case created",
      cta: null,
    },
    {
      id: "evidence",
      timestamp: consentCase.createdAt,
      label: `${consentCase.evidenceItems.length} evidence items linked`,
      cta: (
        <Link
          href={`/cases/${consentCase.id}/evidence`}
          className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
        >
          Open evidence workspace
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      ),
    },
    {
      id: "policy",
      timestamp: consentCase.createdAt,
      label: `Policy: ${policy?.creatorName ?? "Unknown"}`,
      cta: null,
    },
    ...(receipt
      ? [
          {
            id: "verdict",
            timestamp: consentCase.createdAt,
            label: `Verdict: ${receipt.finalVerdict} (${formatConfidence(receipt.score)})`,
            cta: (
              <Link
                href={`/cases/${consentCase.id}/receipt`}
                className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
              >
                View receipt
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            ),
          },
        ]
      : []),
  ];

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-10">
      <Badge variant="accent">{consentCase.status}</Badge>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">{consentCase.title}</h1>
      <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Created {formatDate(consentCase.createdAt)}
      </p>
      <p className="mt-4 max-w-3xl text-base text-muted-foreground">{consentCase.notes}</p>

      <ol className="mt-12 flex flex-col gap-4">
        {timeline.map((entry) => (
          <li key={entry.id} className="rounded-2xl border border-border bg-card p-6">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {formatDate(entry.timestamp)}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-foreground">{entry.label}</h3>
            {entry.cta && <div className="mt-3">{entry.cta}</div>}
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={`/cases/${consentCase.id}/evidence`}
          className="inline-flex h-11 items-center rounded-full bg-accent px-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground transition-colors hover:opacity-90"
        >
          Evidence workspace
        </Link>
        <Link
          href={`/cases/${consentCase.id}/trial`}
          className="inline-flex h-11 items-center rounded-full border border-border bg-card px-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-card-elevated"
        >
          Trial view
        </Link>
        <Link
          href={`/cases/${consentCase.id}/receipt`}
          className="inline-flex h-11 items-center rounded-full border border-border bg-card px-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-card-elevated"
        >
          Receipt view
        </Link>
      </div>
    </div>
  );
}
