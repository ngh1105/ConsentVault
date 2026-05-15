import type { ConsentVaultState } from "@/lib/domain";

export const CONSENT_VAULT_STORAGE_KEY = "consentvault.state";

export function safeStringify(value: ConsentVaultState): string {
  return JSON.stringify(value);
}

export function safeParseConsentVaultState(value: string): ConsentVaultState | null {
  try {
    return JSON.parse(value) as ConsentVaultState;
  } catch {
    return null;
  }
}
