"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useConsentVault } from "@/components/providers/consent-vault-provider";
import { useGenLayerWallet } from "@/components/providers/genlayer-wallet-provider";
import { ConsensusMeter } from "@/components/trial/consensus-meter";
import { TrialGuard } from "@/components/trial/trial-guard";
import { ValidatorCard } from "@/components/ui/validator-card";
import type { ConsentCase, ConsentPolicy } from "@/lib/domain";
import { buildReceiptWalletMetadata } from "@/lib/genlayer/wallet";
import type { TrialResult } from "@/lib/trial-engine";
import { getTrialEngine } from "@/lib/trial-engine.factory";

const VALIDATORS: Record<string, { id: string; name: string; lens: string }> = {
  "Signal House": { id: "signal-house", name: "Signal House", lens: "Identity & impersonation detection" },
  "Persona Watch": { id: "persona-watch", name: "Persona Watch", lens: "Synthetic likeness analysis" },
  "Rights Ledger": { id: "rights-ledger", name: "Rights Ledger", lens: "Licensing & commercial use" },
  "Archive Review": { id: "archive-review", name: "Archive Review", lens: "Attribution & credit verification" },
  "Transparency Lab": { id: "transparency-lab", name: "Transparency Lab", lens: "Labeling & disclosure compliance" },
  "Public Interest Lab": { id: "public-interest-lab", name: "Public Interest Lab", lens: "Fair use & public benefit" },
  "Enforcement Desk": { id: "enforcement-desk", name: "Enforcement Desk", lens: "Policy violation enforcement" },
};

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
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Simulated trial
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {consentCase.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Three fixed validators inspect the archived record, compare it against the creator policy, and produce a consensus receipt.
        </p>

        {errorMessage ? (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm leading-6 text-destructive"
            data-testid="trial-error-banner"
          >
            <p className="font-mono text-xs uppercase tracking-[0.18em]">Trial error</p>
            <p className="mt-2 break-words text-foreground">{errorMessage}</p>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              void executeTrial();
            }}
            disabled={status === "running"}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {status === "running" ? "Running trial..." : "Re-run trial"}
          </button>
          <Link
            href={`/cases/${consentCase.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-card-elevated"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to case
          </Link>
        </div>
      </section>

      {receipt ? <ConsensusMeter receipt={receipt} isRunning={status === "running"} /> : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Validator breakdown</h2>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {judgments.length} judgments
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {judgments.map((judgment) => {
            const validator = VALIDATORS[judgment.validatorName] ?? {
              id: judgment.id,
              name: judgment.validatorName,
              lens: "Consensus validator",
            };
            return (
              <ValidatorCard
                key={judgment.id}
                validator={validator}
                judgment={{
                  verdict: judgment.verdict,
                  confidence: judgment.confidence,
                  reasoning: judgment.reasoning,
                  citedEvidenceIds: judgment.citedEvidenceIds,
                }}
                state={status === "running" ? "loading" : "ready"}
              />
            );
          })}
          {status === "running" && judgments.length === 0 && (
            <>
              <ValidatorCard
                validator={{ id: "placeholder-1", name: "Validator 1", lens: "Analyzing..." }}
                state="loading"
              />
              <ValidatorCard
                validator={{ id: "placeholder-2", name: "Validator 2", lens: "Analyzing..." }}
                state="loading"
              />
              <ValidatorCard
                validator={{ id: "placeholder-3", name: "Validator 3", lens: "Analyzing..." }}
                state="loading"
              />
            </>
          )}
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
