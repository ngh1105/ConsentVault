"use client";

import { Plus, X } from "lucide-react";
import type { PolicyDraft } from "@/lib/policy";

type PolicyFormProps = {
  draft: PolicyDraft;
  blockedUseInput: string;
  blockedUseChips: string[];
  isSaving: boolean;
  onFieldChange: <K extends keyof PolicyDraft>(field: K, value: PolicyDraft[K]) => void;
  onBlockedUseInputChange: (value: string) => void;
  onAddBlockedUses: (value: string) => void;
  onRemoveBlockedUse: (value: string) => void;
  onReset: () => void;
  onSubmit: () => void;
};

export function PolicyForm({
  draft,
  blockedUseInput,
  blockedUseChips,
  isSaving,
  onFieldChange,
  onBlockedUseInputChange,
  onAddBlockedUses,
  onRemoveBlockedUse,
  onReset,
  onSubmit,
}: PolicyFormProps) {
  const handleBlockedUseSubmit = () => {
    onAddBlockedUses(blockedUseInput);
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <section className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
            Creator name
          </span>
          <input
            value={draft.creatorName}
            onChange={(event) => onFieldChange("creatorName", event.target.value)}
            className="w-full rounded-[1.25rem] border border-border/80 bg-background/70 px-4 py-3 text-sm text-foreground"
            autoComplete="name"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
            Creator handle
          </span>
          <input
            value={draft.creatorHandle}
            onChange={(event) => onFieldChange("creatorHandle", event.target.value)}
            className="w-full rounded-[1.25rem] border border-border/80 bg-background/70 px-4 py-3 text-sm text-foreground"
            autoComplete="nickname"
            required
          />
        </label>
      </section>

      <label className="block space-y-2">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
          Allowed uses
        </span>
        <textarea
          value={typeof draft.allowedUses === "string" ? draft.allowedUses : draft.allowedUses.join(", ")}
          onChange={(event) => onFieldChange("allowedUses", event.target.value)}
          className="min-h-28 w-full rounded-[1.4rem] border border-border/80 bg-background/70 px-4 py-3 text-sm leading-6 text-foreground"
          placeholder="Editorial commentary, classroom critique, safety benchmarking"
          aria-describedby="allowed-uses-hint"
        />
        <p id="allowed-uses-hint" className="text-sm leading-6 text-muted-foreground">
          Separate each allowed use with commas to keep the archive summary concise.
        </p>
      </label>

      <div className="space-y-3">
        <div>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
            Blocked uses
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Add restricted use clauses as tags. Separate multiple clauses with commas.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            aria-label="Blocked use input"
            value={blockedUseInput}
            onChange={(event) => onBlockedUseInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                handleBlockedUseSubmit();
              }
            }}
            className="w-full rounded-[1.25rem] border border-border/80 bg-background/70 px-4 py-3 text-sm text-foreground"
            placeholder="Voice cloning, impersonation, dataset resale"
          />
          <button
            type="button"
            onClick={handleBlockedUseSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-accent/20 bg-accent/8 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition hover:border-accent/30 hover:bg-accent/12"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add clause
          </button>
        </div>

        <ul aria-label="Blocked use clauses" className="flex flex-wrap gap-2">
          {blockedUseChips.map((item) => (
            <li key={item}>
              <button
                type="button"
                onClick={() => onRemoveBlockedUse(item)}
                className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/8 px-4 py-2 text-sm text-foreground transition hover:border-accent/30 hover:bg-accent/12"
                aria-label={`Remove blocked use ${item}`}
              >
                <span>{item}</span>
                <X className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <section className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
            Attribution rules
          </span>
          <textarea
            value={draft.attributionRules}
            onChange={(event) => onFieldChange("attributionRules", event.target.value)}
            className="min-h-32 w-full rounded-[1.4rem] border border-border/80 bg-background/70 px-4 py-3 text-sm leading-6 text-foreground"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
            License rules
          </span>
          <textarea
            value={draft.licenseRules}
            onChange={(event) => onFieldChange("licenseRules", event.target.value)}
            className="min-h-32 w-full rounded-[1.4rem] border border-border/80 bg-background/70 px-4 py-3 text-sm leading-6 text-foreground"
            required
          />
        </label>
      </section>

      <label className="block space-y-2">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
          Jurisdiction note
        </span>
        <textarea
          value={draft.jurisdictionNote}
          onChange={(event) => onFieldChange("jurisdictionNote", event.target.value)}
          className="min-h-28 w-full rounded-[1.4rem] border border-border/80 bg-background/70 px-4 py-3 text-sm leading-6 text-foreground"
          required
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-muted-foreground">
          Saving rewrites the active consent policy in the shared archive without changing its record ID.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center rounded-full border border-ink/10 bg-card/70 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition hover:border-accent/20 hover:bg-accent/8"
          >
            Reset draft
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Saving policy" : "Save policy"}
          </button>
        </div>
      </div>
    </form>
  );
}
