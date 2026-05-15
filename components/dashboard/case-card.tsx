import Link from "next/link";
import { ArrowUpRight, BadgeCheck, FileStack, ShieldAlert } from "lucide-react";
import type { ConsentCase, ConsentPolicy, VerdictReceipt } from "@/lib/domain";
import { formatConfidence } from "@/lib/verdict";
import { StatusPill } from "./status-pill";

type CaseCardProps = {
  consentCase: ConsentCase;
  policy: ConsentPolicy;
  receipt?: VerdictReceipt;
};

export function CaseCard({ consentCase, policy, receipt }: CaseCardProps) {
  return (
    <article className="evidence-card flex h-full flex-col p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-3">
          <p className="metadata-label">Case file</p>
          <div>
            <h3 className="font-display text-2xl leading-tight text-balance">{consentCase.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{consentCase.notes}</p>
          </div>
        </div>
        <StatusPill status={consentCase.status} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.4rem] border border-border/80 bg-background/70 p-4">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
            Creator
          </p>
          <p className="mt-2 font-display text-xl">{policy.creatorName}</p>
          <p className="text-sm text-muted-foreground">{policy.creatorHandle}</p>
        </div>
        <div className="rounded-[1.4rem] border border-border/80 bg-background/70 p-4">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
            Policy file
          </p>
          <p className="mt-2 font-display text-xl">{policy.id.replace("policy-", "")}</p>
          <p className="text-sm text-muted-foreground">{policy.blockedUses[0]}</p>
        </div>
      </div>

      <div className="ledger-divider my-5" />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1.35rem] border border-border/75 bg-card/75 p-4">
          <div className="flex items-center gap-2 text-accent">
            <FileStack className="h-4 w-4" aria-hidden="true" />
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">Evidence</span>
          </div>
          <p className="mt-3 font-display text-3xl">{consentCase.evidenceItems.length}</p>
          <p className="text-sm text-muted-foreground">Captured records in the archive</p>
        </div>

        <div className="rounded-[1.35rem] border border-border/75 bg-card/75 p-4">
          <div className="flex items-center gap-2 text-accent">
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">Verdict</span>
          </div>
          <p className="mt-3 font-display text-2xl leading-tight">
            {receipt?.finalVerdict ?? "Pending review"}
          </p>
          <p className="text-sm text-muted-foreground">
            {receipt ? receipt.summary : "Receipt has not been generated for this case yet."}
          </p>
        </div>

        <div className="rounded-[1.35rem] border border-border/75 bg-card/75 p-4">
          <div className="flex items-center gap-2 text-accent">
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">Score</span>
          </div>
          <p className="mt-3 font-display text-3xl">{receipt ? formatConfidence(receipt.score) : "Queued"}</p>
          <p className="text-sm text-muted-foreground">
            {receipt ? receipt.recommendedAction : "Proceed to evidence review to continue the workflow."}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
          Created {new Date(consentCase.createdAt).toLocaleDateString()}
        </p>
        <Link
          href={`/cases/${consentCase.id}`}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md"
        >
          Open case
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
