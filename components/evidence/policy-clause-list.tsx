"use client";

import { FileStack, Link2, ScrollText } from "lucide-react";
import type { ConsentCase, ConsentPolicy } from "@/lib/domain";
import { isBlockedClauseMatched } from "@/lib/evidence";
import { cn } from "@/lib/utils";

type PolicyClauseListProps = {
  policy?: ConsentPolicy;
  matchedClauses: string[];
  consentCase: ConsentCase;
};

export function PolicyClauseList({ policy, matchedClauses, consentCase }: PolicyClauseListProps) {
  if (!policy) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Policy unavailable</p>
        <h2 className="mt-4 text-3xl font-semibold">No creator policy was linked to this evidence file.</h2>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          The workspace can still display the dispute record, but clause matching is unavailable until the case is linked to a policy.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Clause review</p>
          <h2 className="mt-4 text-3xl font-semibold">Blocked-use ledger</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {consentCase.title} is checked against every blocked clause in {policy.creatorName}&apos;s archived policy.
          </p>
        </div>
        <FileStack className="mt-1 h-5 w-5 text-accent" aria-hidden="true" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <article className="rounded-[1.6rem] border border-accent/20 bg-accent/10 p-5">
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-accent" aria-hidden="true" />
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-foreground">Matched clauses</p>
          </div>
          {matchedClauses.length > 0 ? (
            <ul className="mt-4 space-y-3" aria-label="Matched blocked clauses">
              {matchedClauses.map((clause) => (
                <li
                  key={clause}
                  className="rounded-[1.2rem] border border-accent/20 bg-card px-4 py-3 text-sm leading-6 text-foreground"
                >
                  {clause}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              No blocked clause terms surfaced in the selected source, output, notes, or evidence entries.
            </p>
          )}
        </article>

        <article className="rounded-[1.6rem] border border-border/80 bg-background p-5">
          <div className="flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-accent" aria-hidden="true" />
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-foreground">Full blocked-use list</p>
          </div>
          <ul className="mt-4 space-y-3" aria-label="All blocked policy clauses">
            {policy.blockedUses.map((clause) => {
              const isMatch = isBlockedClauseMatched(clause, matchedClauses);

              return (
                <li
                  key={`${policy.id}-${clause}`}
                  className={cn(
                    "rounded-[1.2rem] border px-4 py-3 text-sm leading-6 transition-colors",
                    isMatch
                      ? "border-accent/25 bg-accent/10 text-foreground shadow-sm"
                      : "border-border/70 bg-card text-muted-foreground",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span>{clause}</span>
                    {isMatch ? (
                      <span className="rounded-full border border-accent/30 bg-accent/5 px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-foreground">
                        Match
                      </span>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </article>
      </div>
    </section>
  );
}
