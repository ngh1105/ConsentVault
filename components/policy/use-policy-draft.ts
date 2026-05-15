"use client";

import { useEffect, useMemo, useState } from "react";
import type { ConsentPolicy } from "@/lib/domain";
import { normalizeBlockedUses, savePolicyDraft, type PolicyDraft } from "@/lib/policy";

function createDraft(policy: ConsentPolicy | undefined): PolicyDraft {
  return {
    creatorName: policy?.creatorName ?? "",
    creatorHandle: policy?.creatorHandle ?? "",
    allowedUses: policy?.allowedUses.join(", ") ?? "",
    blockedUses: policy?.blockedUses ?? [],
    attributionRules: policy?.attributionRules ?? "",
    licenseRules: policy?.licenseRules ?? "",
    jurisdictionNote: policy?.jurisdictionNote ?? "",
  };
}

export function usePolicyDraft(policy: ConsentPolicy | undefined) {
  const [draft, setDraft] = useState<PolicyDraft>(() => createDraft(policy));
  const [blockedUseInput, setBlockedUseInput] = useState("");

  useEffect(() => {
    setDraft(createDraft(policy));
    setBlockedUseInput("");
  }, [policy]);

  const blockedUseChips = useMemo(
    () => normalizeBlockedUses(draft.blockedUses),
    [draft.blockedUses],
  );

  const setField = <K extends keyof PolicyDraft>(field: K, value: PolicyDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const addBlockedUses = (value: string) => {
    const merged = normalizeBlockedUses([...blockedUseChips, ...value.split(",")]);
    setDraft((current) => ({ ...current, blockedUses: merged }));
    setBlockedUseInput("");
  };

  const removeBlockedUse = (value: string) => {
    setDraft((current) => ({
      ...current,
      blockedUses: normalizeBlockedUses(current.blockedUses).filter((item) => item !== value),
    }));
  };

  const resetDraft = () => {
    setDraft(createDraft(policy));
    setBlockedUseInput("");
  };

  const save = () => {
    if (!policy) {
      return undefined;
    }

    return savePolicyDraft(policy, draft);
  };

  return {
    draft,
    blockedUseInput,
    blockedUseChips,
    setField,
    setBlockedUseInput,
    addBlockedUses,
    removeBlockedUse,
    resetDraft,
    save,
  };
}
