"use client";

import type { ConsentPolicy } from "@/lib/domain";
import type { IntakeSubmission } from "@/lib/case-intake";

export interface IntakeFormValues extends IntakeSubmission {
  policyId: string;
}

type IntakeFormProps = {
  policies: ConsentPolicy[];
  values: IntakeFormValues;
  isSubmitting: boolean;
  onFieldChange: <K extends keyof IntakeFormValues>(field: K, value: IntakeFormValues[K]) => void;
  onReset: () => void;
  onSubmit: () => void;
};

export function IntakeForm({
  policies,
  values,
  isSubmitting,
  onFieldChange,
  onReset,
  onSubmit,
}: IntakeFormProps) {
  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="block space-y-2" htmlFor="intake-policy">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
          Creator policy
        </span>
        <select
          id="intake-policy"
          value={values.policyId}
          onChange={(event) => onFieldChange("policyId", event.target.value)}
          className="w-full rounded-[1.25rem] border border-border/80 bg-background/70 px-4 py-3 text-sm text-foreground"
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
          onChange={(event) => onFieldChange("title", event.target.value)}
          className="w-full rounded-[1.25rem] border border-border/80 bg-background/70 px-4 py-3 text-sm text-foreground"
          placeholder="Voice clone dispute"
          required
        />
      </label>

      <section className="grid gap-5">
        <label className="space-y-2" htmlFor="intake-source-url">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
            Original source URL
          </span>
          <input
            id="intake-source-url"
            type="url"
            value={values.sourceUrl}
            onChange={(event) => onFieldChange("sourceUrl", event.target.value)}
            className="w-full rounded-[1.25rem] border border-border/80 bg-background/70 px-4 py-3 text-sm text-foreground"
            placeholder="https://creator.example/source"
            required
          />
        </label>

        <label className="space-y-2" htmlFor="intake-ai-output-url">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
            AI output URL
          </span>
          <input
            id="intake-ai-output-url"
            type="url"
            value={values.aiOutputUrl}
            onChange={(event) => onFieldChange("aiOutputUrl", event.target.value)}
            className="w-full rounded-[1.25rem] border border-border/80 bg-background/70 px-4 py-3 text-sm text-foreground"
            placeholder="https://platform.example/output"
            required
          />
        </label>

        <label className="space-y-2" htmlFor="intake-platform-url">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
            Platform URL
          </span>
          <input
            id="intake-platform-url"
            type="url"
            value={values.platformUrl}
            onChange={(event) => onFieldChange("platformUrl", event.target.value)}
            className="w-full rounded-[1.25rem] border border-border/80 bg-background/70 px-4 py-3 text-sm text-foreground"
            placeholder="https://platform.example/post"
            required
          />
        </label>
      </section>

      <label className="block space-y-2" htmlFor="intake-notes">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
          Intake notes
        </span>
        <textarea
          id="intake-notes"
          value={values.notes}
          onChange={(event) => onFieldChange("notes", event.target.value)}
          className="min-h-32 w-full rounded-[1.4rem] border border-border/80 bg-background/70 px-4 py-3 text-sm leading-6 text-foreground"
          placeholder="Why does this look suspicious, deceptive, or out of policy?"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-muted-foreground">
          Submission opens a new draft case and carries the previewed evidence bundle into the archive.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center rounded-full border border-border bg-card/70 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition hover:border-accent/20 hover:bg-accent/10"
          >
            Reset intake
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Opening case" : "Open draft case"}
          </button>
        </div>
      </div>
    </form>
  );
}
