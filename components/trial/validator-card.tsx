"use client";

import { FileStack, Scale, ShieldAlert } from "lucide-react";
import type { EvidenceItem, ValidatorJudgment } from "@/lib/domain";
import { cn } from "@/lib/utils";

const verdictTone: Record<ValidatorJudgment["verdict"], string> = {
  Allowed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-900",
  "Needs Attribution": "border-amber-500/25 bg-amber-500/10 text-amber-950",
  "Needs License": "border-orange-500/25 bg-orange-500/10 text-orange-950",
  "Impersonation Risk": "border-accent/30 bg-accent/10 text-foreground",
  Violation: "border-red-700/25 bg-red-700/10 text-red-950",
};

type ValidatorCardProps = {
  evidenceItems: EvidenceItem[];
  index: number;
  judgment: ValidatorJudgment;
};

function formatConfidence(confidence: number) {
  return `${Math.round(confidence * 100)}% confidence`;
}

export function ValidatorCard({ evidenceItems, index, judgment }: ValidatorCardProps) {
  const citedEvidence = evidenceItems.filter((item) => judgment.citedEvidenceIds.includes(item.id));

  return (
    <article className="evidence-card p-6" aria-labelledby={`${judgment.id}-title`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="metadata-label">Validator {index + 1}</p>
          <h3 id={`${judgment.id}-title`} className="mt-4 font-display text-3xl font-semibold">
            {judgment.validatorName}
          </h3>
        </div>
        <span
          className={cn(
            "inline-flex rounded-full border px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.22em]",
            verdictTone[judgment.verdict],
          )}
        >
          {judgment.verdict}
        </span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem]">
        <div className="rounded-[1.3rem] border border-border/80 bg-background/70 p-4">
          <div className="flex items-center gap-2 text-accent">
            <Scale className="h-4 w-4" aria-hidden="true" />
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">Reasoning</p>
          </div>
          <p className="mt-3 text-sm leading-7 text-foreground">{judgment.reasoning}</p>
        </div>

        <div className="rounded-[1.3rem] border border-border/80 bg-background/70 p-4">
          <div className="flex items-center gap-2 text-accent">
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">Confidence</p>
          </div>
          <p className="mt-3 font-display text-3xl text-foreground">{Math.round(judgment.confidence * 100)}</p>
          <p className="text-sm text-muted-foreground">{formatConfidence(judgment.confidence)}</p>
        </div>
      </div>

      <div className="mt-4 rounded-[1.3rem] border border-border/80 bg-background/70 p-4">
        <div className="flex items-center gap-2 text-accent">
          <FileStack className="h-4 w-4" aria-hidden="true" />
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">Cited evidence</p>
        </div>
        <ul className="mt-4 space-y-3">
          {citedEvidence.map((item) => (
            <li key={item.id} className="rounded-[1.1rem] border border-border/75 bg-card/70 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  {item.type}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
