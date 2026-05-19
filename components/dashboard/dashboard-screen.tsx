"use client";

import * as React from "react";
import Link from "next/link";
import { useConsentVault } from "@/components/providers/consent-vault-provider";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { CaseCard } from "./case-card";

type CaseRow = { id: string; title: string; verdict: string; score: number; date: string };

const columns: Column<CaseRow>[] = [
  { id: "title", header: "Title", cell: (r) => <span className="text-foreground">{r.title}</span> },
  { id: "verdict", header: "Verdict", cell: (r) => <Badge variant="accent">{r.verdict}</Badge> },
  { id: "score", header: "Score", cell: (r) => <span className="font-mono">{r.score}</span>, className: "text-right" },
  { id: "date", header: "Date", cell: (r) => <span className="font-mono text-xs text-muted-foreground">{r.date}</span> },
];

export function DashboardScreen() {
  const { cases, receipts, policies } = useConsentVault();

  const policyById = React.useMemo(
    () => new Map(policies.map((policy) => [policy.id, policy])),
    [policies],
  );
  const receiptByCaseId = React.useMemo(
    () => new Map(receipts.map((receipt) => [receipt.caseId, receipt])),
    [receipts],
  );

  const verdictReadyCount = cases.filter((c) => c.status === "Verdict Ready").length;
  const visibleCases = cases
    .filter((consentCase) => policyById.has(consentCase.policyId))
    .slice(0, 3);

  const rows: CaseRow[] = React.useMemo(
    () =>
      cases.map((c) => {
        const receipt = receiptByCaseId.get(c.id);
        return {
          id: c.id,
          title: c.title,
          verdict: receipt?.finalVerdict ?? c.status,
          score: receipt?.score ?? 0,
          date: new Date(c.createdAt).toLocaleDateString(),
        };
      }),
    [cases, receiptByCaseId],
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <MeshGradient />
        <div className="relative mx-auto max-w-[1280px] px-6 py-24 md:px-10">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            ConsentVault · GenLayer
          </p>
          <h1 className="mt-3 max-w-3xl text-balance text-6xl font-semibold tracking-tight text-foreground">
            Review creator policies, inspect disputes, and move the docket toward a receipt.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Run a three-validator trial against your creator policy and receive a signed verdict on chain.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/cases/new"
              className="inline-flex h-11 items-center rounded-full bg-[hsl(350_80%_44%)] px-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:opacity-90"
            >
              Create case
            </Link>
            <Link
              href="/policy"
              className="inline-flex h-11 items-center rounded-full border border-border bg-card px-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-card-elevated"
            >
              Read the policy
            </Link>
          </div>
        </div>
      </section>

      {/* Stats + verdict signal */}
      <section className="mx-auto max-w-[1280px] px-6 py-16 md:px-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Active cases" value={cases.length} />
          <StatCard label="Receipts issued" value={receipts.length} />
          <StatCard label="Validators online" value={3} />
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Active tribunal signal
          </p>
          <p className="mt-3 text-2xl font-semibold text-foreground">{verdictReadyCount} cases verdict-ready</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Cases with generated receipts can move directly into evidence review, trial replay, or export.
          </p>
        </div>

        {/* Case cards — preserves article + StatusPill "Verdict Ready" + "Open case" link for e2e */}
        <div className="mt-12">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Recent cases
          </h2>
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {visibleCases.length > 0 ? (
              visibleCases.map((consentCase) => {
                const policy = policyById.get(consentCase.policyId);
                if (!policy) return null;
                return (
                  <CaseCard
                    key={consentCase.id}
                    consentCase={consentCase}
                    policy={policy}
                    receipt={receiptByCaseId.get(consentCase.id)}
                  />
                );
              })
            ) : (
              <EmptyState
                headline="No cases yet"
                description="Start by drafting a case and uploading the source material."
                cta={
                  <Link
                    href="/cases/new"
                    className="inline-flex h-10 items-center rounded-full bg-[hsl(350_80%_44%)] px-5 font-mono text-xs uppercase tracking-[0.18em] text-white"
                  >
                    Open new case
                  </Link>
                }
              />
            )}
          </div>
        </div>

        {/* DataTable for full list */}
        {rows.length > 0 && (
          <div className="mt-12">
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              All cases
            </h2>
            <div className="mt-4">
              <DataTable columns={columns} rows={rows} />
            </div>
          </div>
        )}

        {/* Workflow steps */}
        <div className="mt-16 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            From policy to verdict
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              "Capture creator consent rules and blocked uses.",
              "Compare source, output, and platform evidence inside each case.",
              "Advance finished disputes into a receipt-backed verdict.",
            ].map((step, index) => (
              <div key={step} className="rounded-xl border border-border bg-background p-5">
                <p className="font-mono text-xs text-accent">0{index + 1}</p>
                <p className="mt-3 text-sm leading-6 text-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
