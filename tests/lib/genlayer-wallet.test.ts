import { describe, expect, it } from "vitest";
import {
  buildReceiptWalletMetadata,
  formatWalletAddress,
  hasEthereumProvider,
} from "@/lib/genlayer/wallet";

describe("formatWalletAddress", () => {
  it("shortens an EVM address for shell display", () => {
    expect(formatWalletAddress("0x1234567890abcdef1234567890abcdef12345678")).toBe(
      "0x1234...5678",
    );
  });
});

describe("hasEthereumProvider", () => {
  it("detects EIP-1193 providers", () => {
    expect(hasEthereumProvider({ request: async () => [] })).toBe(true);
    expect(hasEthereumProvider({ request: "nope" })).toBe(false);
  });
});

describe("buildReceiptWalletMetadata", () => {
  it("captures connected wallet metadata for receipts", () => {
    expect(
      buildReceiptWalletMetadata({
        address: "0x1234567890abcdef1234567890abcdef12345678",
        chainId: 61999,
        networkName: "GenLayer Studio",
      }),
    ).toEqual({
      issuerAddress: "0x1234567890abcdef1234567890abcdef12345678",
      chainId: 61999,
      networkName: "GenLayer Studio",
      issuedVia: "genlayer-js",
    });
  });
});
