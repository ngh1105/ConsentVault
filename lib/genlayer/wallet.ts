import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

export const GENLAYER_WALLET_NETWORK = studionet;
export const GENLAYER_WALLET_NETWORK_NAME = studionet.name;

export type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

export type WalletConnectionStatus =
  | "missing"
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export type GenLayerWalletMetadata = {
  issuerAddress: string;
  chainId: number;
  networkName: string;
  issuedVia: "genlayer-js";
};

export type ConnectedWalletSnapshot = {
  address: string;
  chainId: number;
  networkName: string;
};

export function hasEthereumProvider(value: unknown): value is EthereumProvider {
  return (
    typeof value === "object" &&
    value !== null &&
    "request" in value &&
    typeof (value as { request?: unknown }).request === "function"
  );
}

export function getBrowserEthereumProvider(): EthereumProvider | null {
  if (typeof window === "undefined") {
    return null;
  }

  return hasEthereumProvider((window as typeof window & { ethereum?: unknown }).ethereum)
    ? (window as typeof window & { ethereum: EthereumProvider }).ethereum
    : null;
}

export function formatWalletAddress(address: string) {
  return address.length <= 12 ? address : `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function buildReceiptWalletMetadata(
  wallet: ConnectedWalletSnapshot | null | undefined,
): GenLayerWalletMetadata | undefined {
  if (!wallet) {
    return undefined;
  }

  return {
    issuerAddress: wallet.address,
    chainId: wallet.chainId,
    networkName: wallet.networkName,
    issuedVia: "genlayer-js",
  };
}

export function createGenLayerWalletClient(provider: EthereumProvider) {
  return createClient({
    chain: GENLAYER_WALLET_NETWORK,
    provider,
  });
}
