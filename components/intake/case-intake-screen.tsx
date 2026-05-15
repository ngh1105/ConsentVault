"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark, NotebookText, Scale } from "lucide-react";
import {
  buildEvidenceBundlePreview,
  buildPreparedIntakeCaseSubmission,
} from "@/lib/case-intake";
import { useConsentVault } from "@/components/providers/consent-vault-provider";
import { EvidenceBundlePreview } from "./evidence-bundle-preview";
import { IntakeForm, type IntakeFormValues } from "./intake-form";

function createEmptyIntakeForm(policyId: string): IntakeFormValues {
  return {
    policyId,
    title: "",
    sourceUrl: "",
    aiOutputUrl: "",
    platformUrl: "",
    notes: "",
  };
}

export function CaseIntakeScreen() {
  const router = useRouter();
  const { dispatch, policies } = useConsentVault();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [values, setValues] = useState<IntakeFormValues>(() => createEmptyIntakeForm(policies[0]?.id ?? ""));

  useEffect(() => {
    if (!policies.length) {
      return;
    }

    const selectedPolicyStillExists = policies.some((policy) => policy.id === values.policyId);

    if (!selectedPolicyStillExists) {
      setValues((current) => ({ ...current, policyId: policies[0].id }));
    }
  }, [policies, values.policyId]);

  const selectedPolicy = useMemo(
    () => policies.find((policy) => policy.id === values.policyId) ?? policies[0],
    [policies, values.policyId],
  );
  const previewItems = useMemo(() => buildEvidenceBundlePreview(values), [values]);

  if (!selectedPolicy) {
    return (
      <section className="evidence-card p-6 sm:p-8">
        <p className="metadata-label">Policy unavailable</p>
        <h1 className="mt-5 font-display text-4xl font-semibold">No creator policy is available for intake.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          Add or restore a consent policy before opening a new dispute file.
        </p>
      </section>
    );
  }

  const handleFieldChange = <K extends keyof IntakeFormValues>(field: K, value: IntakeFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleReset = () => {
    setValues(createEmptyIntakeForm(selectedPolicy.id));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);

    const preparedSubmission = buildPreparedIntakeCaseSubmission(values);
    dispatch({
      type: "case/create",
      payload: preparedSubmission,
    });

    setIsSubmitting(false);
    router.push(`/cases/${preparedSubmission.id}`);
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <article className="evidence-card p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="metadata-label">Dispute intake</span>
            <span className="rounded-full border border-ink/10 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
              archive filing desk
            </span>
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
            File a new dispute, attach the linked policy, and verify the evidence bundle before it lands in the archive.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Each intake starts as a draft case with exactly three evidence records: the source, the AI output, and the platform listing that carries the disputed material.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.4rem] border border-border/80 bg-background/70 p-5">
              <div className="flex items-center gap-2 text-accent">
                <Landmark className="h-4 w-4" aria-hidden="true" />
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">Selected policy</span>
              </div>
              <p className="mt-3 font-display text-2xl">{selectedPolicy.creatorName}</p>
              <p className="text-sm text-muted-foreground">{selectedPolicy.creatorHandle}</p>
            </div>
            <div className="rounded-[1.4rem] border border-border/80 bg-background/70 p-5">
              <div className="flex items-center gap-2 text-accent">
                <NotebookText className="h-4 w-4" aria-hidden="true" />
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">Blocked uses</span>
              </div>
              <p className="mt-3 font-display text-3xl">{selectedPolicy.blockedUses.length}</p>
              <p className="text-sm text-muted-foreground">Restrictions carried into the new case file.</p>
            </div>
            <div className="rounded-[1.4rem] border border-border/80 bg-background/70 p-5">
              <div className="flex items-center gap-2 text-accent">
                <Scale className="h-4 w-4" aria-hidden="true" />
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">Preview cards</span>
              </div>
              <p className="mt-3 font-display text-3xl">{previewItems.length}</p>
              <p className="text-sm text-muted-foreground">Exactly three records are staged before submission.</p>
            </div>
          </div>
        </article>

        <aside className="space-y-4">
          <section className="verdict-banner p-6 text-accent-foreground">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-accent-foreground/80">
              Policy citation
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold">{selectedPolicy.id}</h2>
            <p className="mt-3 text-sm leading-6 text-accent-foreground/85">
              Intake attaches this creator record so the case overview opens with the right consent context.
            </p>
          </section>

          <section className="evidence-card p-6">
            <p className="metadata-label">Active restrictions</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground">
              {selectedPolicy.blockedUses.map((item) => (
                <li key={item} className="rounded-[1.2rem] border border-border/80 bg-background/70 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <article className="evidence-card p-6">
          <p className="metadata-label">Submission form</p>
          <h2 className="mt-4 font-display text-3xl font-semibold">New dispute dossier</h2>
          <div className="mt-6">
            <IntakeForm
              policies={policies}
              values={values}
              isSubmitting={isSubmitting}
              onFieldChange={handleFieldChange}
              onReset={handleReset}
              onSubmit={handleSubmit}
            />
          </div>
        </article>

        <EvidenceBundlePreview items={previewItems} />
      </section>
    </div>
  );
}
