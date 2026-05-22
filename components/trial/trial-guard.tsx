"use client";

import * as React from "react";
import { useGenLayerWallet } from "@/components/providers/genlayer-wallet-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";

export const GENLAYER_CONTRACT_ADDRESS_HINT =
  "Set NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS in .env.local (see docs/deploy-contract.md).";

const CONTRACT_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

function getConfiguredContractAddress(): string | null {
  const value = (process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS ?? "").trim();
  return CONTRACT_ADDRESS_RE.test(value) ? value : null;
}

export function TrialGuard({ children }: { children: React.ReactNode }) {
  const { address, status } = useGenLayerWallet();
  const contractAddress = getConfiguredContractAddress();

  if (!contractAddress) {
    return (
      <EmptyState
        headline="GenLayer contract not configured"
        description={`The trial route is wired to the live GenLayer engine, but the contract address is missing. ${GENLAYER_CONTRACT_ADDRESS_HINT}`}
      />
    );
  }

  if (!address) {
    const isMissingProvider = status === "missing";

    return (
      <EmptyState
        headline="Connect wallet to run the GenLayer trial"
        description={
          isMissingProvider
            ? "No EIP-1193 wallet was detected. Install MetaMask (or another browser wallet) and reload to continue."
            : "The trial route requires a connected wallet to sign the verdict transaction."
        }
        cta={isMissingProvider ? undefined : <WalletConnectButton />}
      />
    );
  }

  return <>{children}</>;
}
