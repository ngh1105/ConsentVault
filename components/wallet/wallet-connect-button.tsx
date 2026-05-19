"use client";

import { LoaderCircle, PlugZap, RefreshCw, Wallet } from "lucide-react";
import { useGenLayerWallet } from "@/components/providers/genlayer-wallet-provider";
import { formatWalletAddress } from "@/lib/genlayer/wallet";
import type { WalletConnectionStatus } from "@/lib/genlayer/wallet";

function buttonLabel(status: WalletConnectionStatus, address: string | null) {
  if (address) return formatWalletAddress(address);
  switch (status) {
    case "missing":
      return "Reload after install";
    case "connecting":
      return "Connecting wallet";
    default:
      return "Connect wallet";
  }
}

function buttonIcon(status: WalletConnectionStatus, address: string | null) {
  if (status === "connecting") {
    return <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />;
  }
  if (address) {
    return <Wallet className="h-4 w-4 text-accent" aria-hidden="true" />;
  }
  if (status === "missing") {
    return <RefreshCw className="h-4 w-4 text-accent" aria-hidden="true" />;
  }
  return <PlugZap className="h-4 w-4 text-accent" aria-hidden="true" />;
}

export function WalletConnectButton() {
  const { address, connect, error, networkName, status } = useGenLayerWallet();
  const isConnecting = status === "connecting";
  const isMissing = status === "missing";

  const handleClick = () => {
    if (isMissing) {
      window.location.reload();
      return;
    }
    void connect();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isConnecting}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-card-elevated disabled:cursor-not-allowed disabled:opacity-60"
      >
        {buttonIcon(status, address)}
        {buttonLabel(status, address)}
      </button>
      <span className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
        {address ? networkName : error ?? ""}
      </span>
    </div>
  );
}
