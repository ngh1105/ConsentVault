"use client";

import * as React from "react";
import {
  type ConnectedWalletSnapshot,
  GENLAYER_WALLET_NETWORK,
  GENLAYER_WALLET_NETWORK_NAME,
  type WalletConnectionStatus,
  createGenLayerWalletClient,
  getBrowserEthereumProvider,
  hasEthereumProvider,
} from "@/lib/genlayer/wallet";

type GenLayerWalletClient = ReturnType<typeof createGenLayerWalletClient>;

type GenLayerWalletContextValue = {
  address: string | null;
  chainId: number | null;
  client: GenLayerWalletClient | null;
  error: string | null;
  networkName: string;
  status: WalletConnectionStatus;
  wallet: ConnectedWalletSnapshot | null;
  connect: () => Promise<void>;
};

const GenLayerWalletContext = React.createContext<GenLayerWalletContextValue | undefined>(
  undefined,
);

function parseChainId(value: unknown): number | null {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return value.startsWith("0x") ? Number.parseInt(value, 16) : Number.parseInt(value, 10);
  }

  return null;
}

function firstAccount(value: unknown): string | null {
  return Array.isArray(value) && typeof value[0] === "string" ? value[0] : null;
}

async function connectClientToStudionet(client: GenLayerWalletClient) {
  if ("connect" in client && typeof client.connect === "function") {
    try {
      await client.connect("studionet");
    } catch {
      // Browser wallets or test providers may not support GenLayer Snap switching yet.
      // Account connection remains useful for receipt metadata.
    }
  }
}

export function GenLayerWalletProvider({ children }: React.PropsWithChildren) {
  const [address, setAddress] = React.useState<string | null>(null);
  const [chainId, setChainId] = React.useState<number | null>(null);
  const [client, setClient] = React.useState<GenLayerWalletClient | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<WalletConnectionStatus>("disconnected");

  React.useEffect(() => {
    if (!getBrowserEthereumProvider()) {
      setStatus("missing");
    }
  }, []);

  const connect = React.useCallback(async () => {
    const provider = getBrowserEthereumProvider();

    if (!provider) {
      setStatus("missing");
      setError("No EIP-1193 wallet provider found.");
      return;
    }

    setStatus("connecting");
    setError(null);

    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      const nextAddress = firstAccount(accounts);

      if (!nextAddress) {
        throw new Error("Wallet did not return an account.");
      }

      const accountAddress = nextAddress as `0x${string}`;
      const nextClient = createGenLayerWalletClient(provider, accountAddress);
      await connectClientToStudionet(nextClient);

      const connectedChainId =
        parseChainId(await provider.request({ method: "eth_chainId" })) ??
        GENLAYER_WALLET_NETWORK.id;

      setAddress(nextAddress);
      setChainId(connectedChainId);
      setClient(nextClient);
      setStatus("connected");
    } catch (caught) {
      setStatus("error");
      setError(caught instanceof Error ? caught.message : "Wallet connection failed.");
    }
  }, []);

  React.useEffect(() => {
    const provider = getBrowserEthereumProvider();

    if (!hasEthereumProvider(provider)) {
      return;
    }

    const handleAccountsChanged = (accounts: unknown) => {
      const nextAddress = firstAccount(accounts);
      setAddress(nextAddress);
      setStatus(nextAddress ? "connected" : "disconnected");
    };
    const handleChainChanged = (nextChainId: unknown) => {
      setChainId(parseChainId(nextChainId));
    };

    provider.on?.("accountsChanged", handleAccountsChanged);
    provider.on?.("chainChanged", handleChainChanged);

    return () => {
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  const wallet = React.useMemo<ConnectedWalletSnapshot | null>(() => {
    if (!address || !chainId) {
      return null;
    }

    return {
      address,
      chainId,
      networkName: GENLAYER_WALLET_NETWORK_NAME,
    };
  }, [address, chainId]);

  const value = React.useMemo<GenLayerWalletContextValue>(
    () => ({
      address,
      chainId,
      client,
      error,
      networkName: GENLAYER_WALLET_NETWORK_NAME,
      status,
      wallet,
      connect,
    }),
    [address, chainId, client, connect, error, status, wallet],
  );

  return (
    <GenLayerWalletContext.Provider value={value}>{children}</GenLayerWalletContext.Provider>
  );
}

export function useGenLayerWallet() {
  const context = React.useContext(GenLayerWalletContext);

  if (!context) {
    throw new Error("useGenLayerWallet must be used within a GenLayerWalletProvider");
  }

  return context;
}
