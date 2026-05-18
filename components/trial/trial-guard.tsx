"use client";

import * as React from "react";
import Link from "next/link";
import { LoaderCircle, PlugZap, ShieldAlert } from "lucide-react";
import { useGenLayerWallet } from "@/components/providers/genlayer-wallet-provider";
import { resolveTrialEngineKind } from "@/lib/trial-engine.factory";

export const GENLAYER_CONTRACT_ADDRESS_HINT =
  "Set NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS in .env.local (see docs/deploy-contract.md).";

function getConfiguredContractAddress(): string | null {
  const value = (process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS ?? "").trim();
  return value.startsWith("0x") ? value : null;
}

function GuardShell({
  title,
  body,
  icon,
  actions,
}: {
  title: string;
  body: React.ReactNode;
  icon: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section
      className="evidence-card p-6 sm:p-8"
      role="status"
      aria-live="polite"
      data-testid="trial-guard"
    >
      <div className="flex items-center gap-3 text-accent">{icon}</div>
      <h1 className="mt-5 font-display text-4xl font-semibold">{title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{body}</p>
      {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
      <Link
        href="/"
        className="mt-6 inline-flex rounded-full border border-ink/10 bg-card/70 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition hover:border-accent/20 hover:bg-accent/8"
      >
        Back to dashboard
      </Link>
    </section>
  );
}

export function TrialGuard({ children }: { children: React.ReactNode }) {
  const engineKind = resolveTrialEngineKind();
  const { address, status, connect, error } = useGenLayerWallet();

  if (engineKind !== "genlayer") {
    return <>{children}</>;
  }

  const contractAddress = getConfiguredContractAddress();

  if (!contractAddress) {
    return (
      <GuardShell
        icon={<ShieldAlert className="h-6 w-6" aria-hidden="true" />}
        title="GenLayer contract not configured"
        body={
          <>
            The trial route is wired to the live GenLayer engine, but the
            contract address is missing. {GENLAYER_CONTRACT_ADDRESS_HINT}
          </>
        }
      />
    );
  }

  if (!address) {
    const isMissingProvider = status === "missing";
    const isConnecting = status === "connecting";

    return (
      <GuardShell
        icon={<PlugZap className="h-6 w-6" aria-hidden="true" />}
        title="Connect wallet to run the GenLayer trial"
        body={
          isMissingProvider ? (
            "No EIP-1193 wallet was detected. Install MetaMask (or another browser wallet) and reload to continue."
          ) : (
            <>
              The trial submits a transaction to the deployed contract on
              Studionet. Connect your wallet so the receipt can be signed by
              your account.
              {error ? (
                <span className="mt-3 block font-mono text-xs uppercase tracking-[0.22em] text-destructive">
                  {error}
                </span>
              ) : null}
            </>
          )
        }
        actions={
          isMissingProvider ? null : (
            <button
              type="button"
              onClick={() => {
                void connect();
              }}
              disabled={isConnecting}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground transition hover:translate-y-[-1px] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isConnecting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <PlugZap className="h-4 w-4" aria-hidden="true" />
              )}
              {isConnecting ? "Connecting wallet" : "Connect wallet"}
            </button>
          )
        }
      />
    );
  }

  return <>{children}</>;
}
