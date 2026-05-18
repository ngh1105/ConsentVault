"use client";

import * as React from "react";
import {
  type ConnectedWalletSnapshot,
  type EthereumProvider,
  GENLAYER_WALLET_NETWORK,
  GENLAYER_WALLET_NETWORK_NAME,
  type WalletConnectionStatus,
  createGenLayerWalletClient,
  getBrowserEthereumProvider,
  hasEthereumProvider,
} from "@/lib/genlayer/wallet";

type GenLayerWalletClient = ReturnType<typeof createGenLayerWalletClient>;

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

function isValidAddress(value: string): value is `0x${string}` {
  return ADDRESS_RE.test(value);
}

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
    } catch (caught) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[consentvault] studionet connect failed:", caught);
      }
    }
  }
}

function rebuildClientForAccount(
  provider: EthereumProvider,
  address: `0x${string}`,
): GenLayerWalletClient {
  const next = createGenLayerWalletClient(provider, address);
  void connectClientToStudionet(next);
  return next;
}

export function GenLayerWalletProvider({ children }: React.PropsWithChildren) {
  const [address, setAddress] = React.useState<string | null>(null);
  const [chainId, setChainId] = React.useState<number | null>(null);
  const [client, setClient] = React.useState<GenLayerWalletClient | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<WalletConnectionStatus>("disconnected");
  const addressRef = React.useRef<string | null>(null);
  const statusRef = React.useRef<WalletConnectionStatus>("disconnected");
  React.useEffect(() => {
    addressRef.current = address;
  }, [address]);
  React.useEffect(() => {
    statusRef.current = status;
  }, [status]);

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

      if (!isValidAddress(nextAddress)) {
        setStatus("error");
        setError("Wallet returned an invalid address.");
        return;
      }
      const accountAddress = nextAddress;
      const nextClient = rebuildClientForAccount(provider, accountAddress);

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
      const next = firstAccount(accounts);
      if (!next || !isValidAddress(next)) {
        setAddress(null);
        setClient(null);
        setStatus(next ? "error" : "disconnected");
        setError(next ? "Wallet returned an invalid address." : null);
        return;
      }
      setAddress(next);
      setClient(rebuildClientForAccount(provider, next));
      setStatus("connected");
      setError(null);
    };

    const handleChainChanged = (nextChainId: unknown) => {
      const parsed = parseChainId(nextChainId);
      setChainId(parsed);
      const currentAddress = addressRef.current;
      if (currentAddress && isValidAddress(currentAddress)) {
        setClient(rebuildClientForAccount(provider, currentAddress));
      }
    };

    const handleFocus = () => {
      if (statusRef.current === "missing" && getBrowserEthereumProvider()) {
        setStatus("disconnected");
      }
    };

    provider.on?.("accountsChanged", handleAccountsChanged);
    provider.on?.("chainChanged", handleChainChanged);
    window.addEventListener("focus", handleFocus);

    return () => {
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
      window.removeEventListener("focus", handleFocus);
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
