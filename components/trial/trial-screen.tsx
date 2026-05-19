"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Gavel, Landmark, LoaderCircle, RotateCcw, Sparkles } from "lucide-react";
import { useConsentVault } from "@/components/providers/consent-vault-provider";
import { useGenLayerWallet } from "@/components/providers/genlayer-wallet-provider";
import { ConsensusMeter } from "@/components/trial/consensus-meter";
import { TrialGuard } from "@/components/trial/trial-guard";
import { ValidatorCard } from "@/components/trial/validator-card";
import type { ConsentCase, ConsentPolicy } from "@/lib/domain";
import { buildReceiptWalletMetadata } from "@/lib/genlayer/wallet";
import type { TrialResult } from "@/lib/trial-engine";
import { getTrialEngine } from "@/lib/trial-engine.factory";

type TrialScreenProps = {
  caseId: string;
};

type TrialStatus = "idle" | "running" | "complete" | "error";

function MissingState({ title, description }: { title: string; description: string }) {
  return (
    <section className="evidence-card p-6 sm:p-8">
      <p className="metadata-label">Trial unavailable</p>
      <h1 className="mt-5 font-display text-4xl font-semibold">{title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground"
      >
        Back to dashboard
      </Link>
    </section>
  );
}

function TrialWorkspace({ consentCase, policy }: { consentCase: ConsentCase; policy: ConsentPolicy }) {
  const { dispatch, getReceiptByCaseId } = useConsentVault();
  const { wallet, client: walletClient } = useGenLayerWallet();
  const seededReceipt = getReceiptByCaseId(consentCase.id);
  const [status, setStatus] = React.useState<TrialStatus>(seededReceipt ? "complete" : "idle");
  const [result, setResult] = React.useState<TrialResult | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const consentCaseRef = React.useRef(consentCase);
  const policyRef = React.useRef(policy);
  const walletRef = React.useRef(wallet);
  const walletClientRef = React.useRef(walletClient);

  React.useEffect(() => {
    consentCaseRef.current = consentCase;
  }, [consentCase]);

  React.useEffect(() => {
    policyRef.current = policy;
  }, [policy]);

  React.useEffect(() => {
    walletRef.current = wallet;
  }, [wallet]);

  React.useEffect(() => {
    walletClientRef.current = walletClient;
  }, [walletClient]);

  const runTrial = React.useCallback(
    async (cancelledRef: { current: boolean }) => {
      setStatus("running");
      setErrorMessage(null);
      try {
        const engine = getTrialEngine({ walletClient: walletClientRef.current });
        const nextResult = await engine.runTrial({
          case: consentCaseRef.current,
          policy: policyRef.current,
          wallet: buildReceiptWalletMetadata(walletRef.current),
        });
        if (cancelledRef.current) return;
        setResult(nextResult);
        dispatch({ type: "receipt/save", payload: nextResult.receipt });
        setStatus("complete");
      } catch (caught) {
        if (cancelledRef.current) return;
        setErrorMessage(caught instanceof Error ? caught.message : "Trial run failed.");
        setStatus("error");
      }
    },
    [dispatch],
  );

  const manualCancelRef = React.useRef({ current: false });

  const executeTrial = React.useCallback(() => {
    void runTrial(manualCancelRef.current);
  }, [runTrial]);

  // Auto-run trial once on mount only when no seeded receipt exists for this case.
  // Depends only on stable IDs so receipt/save dispatch (which derives a new
  // consentCase reference) does not re-trigger the effect.
  const caseId = consentCase.id;
  const policyId = policy.id;
  const hasSeededReceipt = Boolean(seededReceipt);

  React.useEffect(() => {
    if (hasSeededReceipt) return;
    const cancelled = { current: false };
    void runTrial(cancelled);
    return () => {
      cancelled.current = true;
    };
  }, [caseId, policyId, hasSeededReceipt, runTrial]);

  const receipt = result?.receipt ?? seededReceipt;
  const judgments = result?.judgments ?? seededReceipt?.judgments ?? [];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <article className="evidence-card p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="metadata-label">Simulated trial</span>
            <span className="rounded-full border border-ink/10 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
              deterministic consensus
            </span>
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
            {consentCase.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            Three fixed validators inspect the archived record, compare it against the creator policy, and produce a consensus receipt without any network or LLM calls.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.4rem] border border-border/80 bg-background/70 p-5">
              <div className="flex items-center gap-2 text-accent">
                <Landmark className="h-4 w-4" aria-hidden="true" />
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">Policy source</span>
              </div>
              <p className="mt-3 font-display text-2xl">{policy.creatorName}</p>
              <p className="text-sm text-muted-foreground">{policy.creatorHandle}</p>
            </div>
            <div className="rounded-[1.4rem] border border-border/80 bg-background/70 p-5">
              <div className="flex items-center gap-2 text-accent">
                <Gavel className="h-4 w-4" aria-hidden="true" />
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">Validators</span>
              </div>
              <p className="mt-3 font-display text-3xl">3</p>
              <p className="text-sm text-muted-foreground">Signal House, Rights Ledger, and companion reviewers.</p>
            </div>
            <div className="rounded-[1.4rem] border border-border/80 bg-background/70 p-5">
              <div className="flex items-center gap-2 text-accent">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">Run state</span>
              </div>
              <p className="mt-3 font-display text-3xl capitalize">{status}</p>
              <p className="text-sm text-muted-foreground">
                {status === "running"
                  ? "Receipt generation is unfolding across the consensus meter below."
                  : status === "error"
                    ? "The trial engine returned an error. Re-run after resolving the cause."
                    : "Consensus is ready for review and downstream receipt export."}
              </p>
            </div>
          </div>

          {errorMessage ? (
            <div
              role="alert"
              className="mt-6 rounded-[1.3rem] border border-destructive/40 bg-destructive/10 p-4 text-sm leading-6 text-destructive"
              data-testid="trial-error-banner"
            >
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">Trial error</p>
              <p className="mt-2 break-words text-foreground">{errorMessage}</p>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                void executeTrial();
              }}
              disabled={status === "running"}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground transition hover:translate-y-[-1px] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {status === "running" ? "Running trial" : "Re-run trial"}
            </button>
            <p className="text-sm text-muted-foreground">
              Re-running uses the same deterministic rules, so seeded cases remain stable across refreshes.
            </p>
          </div>
        </article>

        <aside className="space-y-4">
          {receipt ? <ConsensusMeter receipt={receipt} isRunning={status === "running"} /> : null}

          <section className="evidence-card p-6">
            <div className="flex items-center gap-3">
              <LoaderCircle className={status === "running" ? "h-5 w-5 animate-spin text-accent" : "h-5 w-5 text-accent"} aria-hidden="true" />
              <h2 className="font-display text-3xl font-semibold">Trial ledger</h2>
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
                  GenLayer issuer
                </dt>
                <dd className="mt-1 text-foreground">{receipt?.wallet?.issuerAddress ?? "No wallet attached"}</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  Evidence in scope
                </dt>
                <dd className="mt-1 text-foreground">{consentCase.evidenceItems.length} archived items</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  Summary
                </dt>
                <dd className="mt-1 text-foreground">
                  {receipt?.summary ?? "Running the deterministic trial to populate the receipt."}
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

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="metadata-label">Validator reasoning</p>
            <h2 className="mt-4 font-display text-3xl font-semibold">Consensus breakdown</h2>
          </div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
            {judgments.length} judgments recorded
          </p>
        </div>
        <div className="grid gap-4">
          {judgments.map((judgment, index) => (
            <ValidatorCard
              key={judgment.id}
              evidenceItems={consentCase.evidenceItems}
              index={index}
              judgment={judgment}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export function TrialScreen({ caseId }: TrialScreenProps) {
  const { getCaseById, getPolicyById } = useConsentVault();
  const consentCase = getCaseById(caseId);

  if (!consentCase) {
    return (
      <MissingState
        title="No trial record exists for this case."
        description="Return to the dashboard and open a seeded dispute before entering the trial route."
      />
    );
  }

  const policy = getPolicyById(consentCase.policyId);

  if (!policy) {
    return (
      <MissingState
        title="The linked creator policy could not be loaded."
        description="This trial route needs an attached policy before it can calculate validator consensus."
      />
    );
  }

  return (
    <TrialGuard>
      <TrialWorkspace consentCase={consentCase} policy={policy} />
    </TrialGuard>
  );
}
