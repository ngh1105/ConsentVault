"use client";

import * as React from "react";
import type { VerdictReceipt } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { collectCitedEvidenceIds, formatConfidence, toPercentageScore } from "@/lib/verdict";

const verdictTone: Record<VerdictReceipt["finalVerdict"], string> = {
  Allowed: "text-emerald-950",
  "Needs Attribution": "text-amber-950",
  "Needs License": "text-orange-950",
  "Impersonation Risk": "text-accent-foreground",
  Violation: "text-accent-foreground",
};

type ConsensusMeterProps = {
  isRunning?: boolean;
  receipt: VerdictReceipt;
};

export function ConsensusMeter({ isRunning = false, receipt }: ConsensusMeterProps) {
  const targetScore = toPercentageScore(receipt.score);
  const [displayScore, setDisplayScore] = React.useState(8);

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setDisplayScore(Math.max(8, Math.min(100, targetScore)));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [targetScore]);

  const supportCount = receipt.judgments.filter(
    (judgment) => judgment.verdict === receipt.finalVerdict,
  ).length;
  const citedEvidenceCount = collectCitedEvidenceIds(receipt.judgments).length;

  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-7" aria-labelledby="consensus-meter-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Consensus meter</p>
          <h2 id="consensus-meter-title" className="mt-4 text-4xl font-semibold">
            {receipt.finalVerdict}
          </h2>
        </div>
        <div
          className={cn(
            "rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.22em]",
            receipt.finalVerdict === "Impersonation Risk" || receipt.finalVerdict === "Violation"
              ? "rounded-3xl border border-border bg-card"
              : "border border-border/80 bg-background/75",
            verdictTone[receipt.finalVerdict],
          )}
        >
          {formatConfidence(receipt.score)}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>Aggregate alignment</span>
          <span>{Math.round(targetScore)} / 100</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-border/70" aria-hidden="true">
          <div
            className={cn(
              "h-full rounded-full bg-accent transition-[width] duration-700 ease-out",
              isRunning && "animate-pulse",
            )}
            style={{ width: `${displayScore}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.3rem] border border-border/80 bg-background/70 p-4">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
            Supporting validators
          </p>
          <p className="mt-3 font-display text-3xl text-foreground">{supportCount}</p>
        </div>
        <div className="rounded-[1.3rem] border border-border/80 bg-background/70 p-4">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
            Evidence references
          </p>
          <p className="mt-3 font-display text-3xl text-foreground">{citedEvidenceCount}</p>
        </div>
        <div className="rounded-[1.3rem] border border-border/80 bg-background/70 p-4">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
            Recommended action
          </p>
          <p className="mt-3 text-sm leading-6 text-foreground">{receipt.recommendedAction}</p>
        </div>
      </div>
    </section>
  );
}
