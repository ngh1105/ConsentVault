"use client";

import { useEffect, useMemo, useState } from "react";
import { PolicyForm } from "@/components/policy/policy-form";
import { usePolicyDraft } from "@/components/policy/use-policy-draft";
import { useConsentVault } from "@/components/providers/consent-vault-provider";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

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
      <EmptyState
        headline="No creator policy is available to edit"
        description="Seed a consent policy or select a case that already references one before opening the builder."
      />
    );
  }

  const preview = draftState.save();
  if (!preview) {
    return null;
  }

  const handleSave = () => {
    setIsSaving(true);
    dispatch({ type: "policy/save", payload: preview });
    setSaveMessage(`Saved ${preview.creatorName}'s policy.`);
    setIsSaving(false);
  };

  return (
    <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-10">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Creator policy</h1>
        <Badge variant="accent">Active</Badge>
      </div>
      {saveMessage ? (
        <p className="mt-4 text-sm text-accent">{saveMessage}</p>
      ) : null}
      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_minmax(0,28rem)]">
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
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">policy.json</p>
            <pre className="mt-3 max-h-[60vh] overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-foreground">
              {JSON.stringify(preview, null, 2)}
            </pre>
          </div>
        </aside>
      </div>
    </div>
  );
}
