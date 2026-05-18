"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildEvidenceBundlePreview,
  buildPreparedIntakeCaseSubmission,
} from "@/lib/case-intake";
import { useConsentVault } from "@/components/providers/consent-vault-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { EvidenceBundlePreview } from "./evidence-bundle-preview";
import type { IntakeFormValues } from "./intake-form";

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{title}</h2>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
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
      <EmptyState
        headline="No creator policy is available for intake"
        description="Add or restore a consent policy before opening a new dispute file."
      />
    );
  }

  const handleFieldChange = <K extends keyof IntakeFormValues>(field: K, value: IntakeFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleReset = () => {
    setValues(createEmptyIntakeForm(selectedPolicy.id));
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const caseId = `case-${Date.now()}`;
      const preparedSubmission = buildPreparedIntakeCaseSubmission(values, {
        id: caseId,
      });
      dispatch({
        type: "case/create",
        payload: preparedSubmission,
      });

      await router.push(`/cases/${caseId}`);
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:px-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">New case</h1>
      <div className="mt-8 flex flex-col gap-12">
        <Section title="Case info">
          <label className="block space-y-2" htmlFor="intake-policy">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
              Creator policy
            </span>
            <select
              id="intake-policy"
              value={values.policyId}
              onChange={(event) => handleFieldChange("policyId", event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
              required
            >
              {policies.map((policy) => (
                <option key={policy.id} value={policy.id}>
                  {policy.creatorName} ({policy.creatorHandle})
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2" htmlFor="intake-title">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
              Suspicious content title
            </span>
            <input
              id="intake-title"
              value={values.title}
              onChange={(event) => handleFieldChange("title", event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
              placeholder="Voice clone dispute"
              required
            />
          </label>
        </Section>

        <Section title="Original content">
          <label className="block space-y-2" htmlFor="intake-source-url">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
              Original source URL
            </span>
            <input
              id="intake-source-url"
              type="url"
              value={values.sourceUrl}
              onChange={(event) => handleFieldChange("sourceUrl", event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
              placeholder="https://creator.example/source"
              required
            />
          </label>
        </Section>

        <Section title="AI output">
          <label className="block space-y-2" htmlFor="intake-ai-output-url">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
              AI output URL
            </span>
            <input
              id="intake-ai-output-url"
              type="url"
              value={values.aiOutputUrl}
              onChange={(event) => handleFieldChange("aiOutputUrl", event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
              placeholder="https://platform.example/output"
              required
            />
          </label>
        </Section>

        <Section title="Source links">
          <label className="block space-y-2" htmlFor="intake-platform-url">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
              Platform URL
            </span>
            <input
              id="intake-platform-url"
              type="url"
              value={values.platformUrl}
              onChange={(event) => handleFieldChange("platformUrl", event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
              placeholder="https://platform.example/post"
              required
            />
          </label>
        </Section>

        <Section title="Notes">
          <label className="block space-y-2" htmlFor="intake-notes">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
              Intake notes
            </span>
            <textarea
              id="intake-notes"
              value={values.notes}
              onChange={(event) => handleFieldChange("notes", event.target.value)}
              className="min-h-32 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm leading-6 text-foreground"
              placeholder="Why does this look suspicious, deceptive, or out of policy?"
            />
          </label>
        </Section>
      </div>

      <div className="sticky bottom-0 mt-12 -mx-6 border-t border-border bg-background/90 px-6 py-4 backdrop-blur-md md:-mx-10 md:px-10">
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-10 items-center rounded-full border border-border bg-card px-5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-card-elevated"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => { void handleSubmit(); }}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center rounded-full bg-accent px-5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Opening case" : "Open draft case"}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <EvidenceBundlePreview items={previewItems} />
      </div>
    </div>
  );
}
