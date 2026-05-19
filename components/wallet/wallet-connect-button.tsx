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
    <div className="flex flex-col gap-2 lg:items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={isConnecting}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-ink/10 bg-card/70 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition hover:border-accent/20 hover:bg-accent/8 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {buttonIcon(status, address)}
        {buttonLabel(status, address)}
      </button>
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
        {address ? networkName : error ?? "GenLayer wallet"}
      </p>
    </div>
  );
}
