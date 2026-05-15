"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Landmark, ShieldBan, Sparkles } from "lucide-react";
import { PolicyForm } from "@/components/policy/policy-form";
import { usePolicyDraft } from "@/components/policy/use-policy-draft";
import { useConsentVault } from "@/components/providers/consent-vault-provider";

export function PolicyBuilderScreen() {
  const { activeCase, dispatch, getPolicyById, policies } = useConsentVault();
  const activePolicy = useMemo(
    () => (activeCase ? getPolicyById(activeCase.policyId) : policies[0]) ?? policies[0],
    [activeCase, getPolicyById, policies],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const draftState = usePolicyDraft(activePolicy);

  useEffect(() => {
    if (!saveMessage) {
      return;
    }

    const timeout = window.setTimeout(() => setSaveMessage(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [saveMessage]);

  if (!activePolicy) {
    return (
      <section className="evidence-card p-6 sm:p-8">
        <p className="metadata-label">Policy unavailable</p>
        <h1 className="mt-5 font-display text-4xl font-semibold">No creator policy is available to edit.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          Seed a consent policy in the archive or select a case that already references one before opening the builder.
        </p>
      </section>
    );
  }

  const preview = draftState.save();
  if (!preview) {
    return null;
  }

  const handleSave = () => {
    setIsSaving(true);
    dispatch({ type: "policy/save", payload: preview });
    setSaveMessage(`Saved ${preview.creatorName}'s archive policy.`);
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <article className="evidence-card p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="metadata-label">Policy builder</span>
            <span className="rounded-full border border-ink/10 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
              legal archive editor
            </span>
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
            Shape the consent policy that every case summary and verdict route reads.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Update creator identity, reuse permissions, and restricted clauses in a single record so the active archive stays consistent from dashboard to case overview.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.4rem] border border-border/80 bg-background/70 p-5">
              <div className="flex items-center gap-2 text-accent">
                <Landmark className="h-4 w-4" aria-hidden="true" />
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">Current policy</span>
              </div>
              <p className="mt-3 font-display text-2xl">{activePolicy.creatorName}</p>
              <p className="text-sm text-muted-foreground">{activePolicy.creatorHandle}</p>
            </div>
            <div className="rounded-[1.4rem] border border-border/80 bg-background/70 p-5">
              <div className="flex items-center gap-2 text-accent">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">Allowed uses</span>
              </div>
              <p className="mt-3 font-display text-3xl">{preview.allowedUses.length}</p>
              <p className="text-sm text-muted-foreground">Normalized clauses in the public permission set.</p>
            </div>
            <div className="rounded-[1.4rem] border border-border/80 bg-background/70 p-5">
              <div className="flex items-center gap-2 text-accent">
                <ShieldBan className="h-4 w-4" aria-hidden="true" />
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">Blocked uses</span>
              </div>
              <p className="mt-3 font-display text-3xl">{preview.blockedUses.length}</p>
              <p className="text-sm text-muted-foreground">Tag-style restrictions carried into summaries and disputes.</p>
            </div>
          </div>
        </article>

        <aside className="space-y-4">
          <section className="verdict-banner p-6 text-accent-foreground">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-accent-foreground/80">
              Active record target
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold">{activePolicy.id}</h2>
            <p className="mt-3 text-sm leading-6 text-accent-foreground/85">
              {activeCase
                ? `This builder is editing the policy attached to ${activeCase.title}.`
                : "No case is selected, so the first seeded policy is loaded for editing."}
            </p>
          </section>

          <section className="evidence-card p-6">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="font-display text-3xl font-semibold">Save behavior</h2>
            </div>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-foreground">
              <li className="rounded-[1.2rem] border border-border/80 bg-background/70 px-4 py-3">
                Preserves the policy ID and archive creation timestamp.
              </li>
              <li className="rounded-[1.2rem] border border-border/80 bg-background/70 px-4 py-3">
                Normalizes allowed and blocked clauses before dispatching policy/save.
              </li>
              <li className="rounded-[1.2rem] border border-border/80 bg-background/70 px-4 py-3">
                Immediately updates dashboards and case views that reference the same policy.
              </li>
            </ul>
            {saveMessage ? <p className="mt-4 text-sm leading-6 text-accent">{saveMessage}</p> : null}
          </section>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <article className="evidence-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="metadata-label">Editable policy</p>
              <h2 className="mt-4 font-display text-3xl font-semibold">Creator consent record</h2>
            </div>
          </div>
          <div className="mt-6">
            <PolicyForm
              draft={draftState.draft}
              blockedUseInput={draftState.blockedUseInput}
              blockedUseChips={draftState.blockedUseChips}
              isSaving={isSaving}
              onFieldChange={draftState.setField}
              onBlockedUseInputChange={draftState.setBlockedUseInput}
              onAddBlockedUses={draftState.addBlockedUses}
              onRemoveBlockedUse={draftState.removeBlockedUse}
              onReset={draftState.resetDraft}
              onSubmit={handleSave}
            />
          </div>
        </article>

        <aside className="space-y-4">
          <section className="evidence-card p-6">
            <p className="metadata-label">Preview</p>
            <h2 className="mt-4 font-display text-3xl font-semibold">Policy summary card</h2>
            <div className="mt-5 space-y-5">
              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  Creator
                </p>
                <p className="mt-2 font-display text-2xl">{preview.creatorName || "Unnamed creator"}</p>
                <p className="text-sm text-muted-foreground">{preview.creatorHandle || "No handle supplied"}</p>
              </div>
              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  Allowed uses
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground">
                  {preview.allowedUses.map((item) => (
                    <li key={item} className="rounded-[1.1rem] border border-border/70 bg-background/65 px-4 py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  Blocked uses
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {preview.blockedUses.map((item) => (
                    <span key={item} className="inline-flex rounded-full border border-accent/20 bg-accent/8 px-4 py-2 text-sm text-foreground">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid gap-3">
                <div className="rounded-[1.2rem] border border-border/70 bg-background/65 p-4">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                    Attribution rules
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{preview.attributionRules}</p>
                </div>
                <div className="rounded-[1.2rem] border border-border/70 bg-background/65 p-4">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                    License rules
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{preview.licenseRules}</p>
                </div>
                <div className="rounded-[1.2rem] border border-border/70 bg-background/65 p-4">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                    Jurisdiction note
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{preview.jurisdictionNote}</p>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
