"use client";

import { LoaderCircle, PlugZap, Wallet } from "lucide-react";
import { useGenLayerWallet } from "@/components/providers/genlayer-wallet-provider";
import { formatWalletAddress } from "@/lib/genlayer/wallet";

export function WalletConnectButton() {
  const { address, connect, error, networkName, status } = useGenLayerWallet();
  const isConnecting = status === "connecting";
  const isMissing = status === "missing";
  const label = address
    ? formatWalletAddress(address)
    : isMissing
      ? "Install MetaMask"
      : isConnecting
        ? "Connecting wallet"
        : "Connect wallet";

  return (
    <div className="flex flex-col gap-2 lg:items-end">
      <button
        type="button"
        onClick={() => {
          void connect();
        }}
        disabled={isConnecting || isMissing}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-ink/10 bg-card/70 px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition hover:border-accent/20 hover:bg-accent/8 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isConnecting ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : address ? (
          <Wallet className="h-4 w-4 text-accent" aria-hidden="true" />
        ) : (
          <PlugZap className="h-4 w-4 text-accent" aria-hidden="true" />
        )}
        {label}
      </button>
      <p className="text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
        {address ? networkName : error ?? "GenLayer wallet"}
      </p>
    </div>
  );
}
