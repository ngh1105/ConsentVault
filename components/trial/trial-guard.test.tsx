import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { GenLayerWalletProvider } from "@/components/providers/genlayer-wallet-provider";
import { TrialGuard } from "@/components/trial/trial-guard";

const ORIGINAL_ADDRESS = process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS;

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

function installEthereumMock(accounts: string[] = []) {
  const request = vi.fn(async ({ method }: { method: string }) => {
    if (method === "eth_requestAccounts" || method === "eth_accounts") {
      return accounts;
    }
    if (method === "eth_chainId") {
      return "0xf22f";
    }
    return null;
  });

  Object.defineProperty(window, "ethereum", {
    configurable: true,
    value: { request, on: vi.fn(), removeListener: vi.fn() },
  });
}

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(window, "ethereum");
  restoreEnv("NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS", ORIGINAL_ADDRESS);
});

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS;
});

describe("TrialGuard", () => {
  it("blocks the workspace when the contract address is unset", () => {
    installEthereumMock();

    render(
      <GenLayerWalletProvider>
        <TrialGuard>
          <p>Workspace content</p>
        </TrialGuard>
      </GenLayerWalletProvider>,
    );

    expect(
      screen.getByRole("heading", { name: /GenLayer contract not configured/i }),
    ).toBeVisible();
    expect(screen.queryByText("Workspace content")).not.toBeInTheDocument();
  });

  it("blocks when contract is configured but the wallet has no account yet", () => {
    process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS =
      "0x1111111111111111111111111111111111111111";
    installEthereumMock();

    render(
      <GenLayerWalletProvider>
        <TrialGuard>
          <p>Workspace content</p>
        </TrialGuard>
      </GenLayerWalletProvider>,
    );

    expect(
      screen.getByRole("heading", { name: /Connect wallet to run the GenLayer trial/i }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: /Connect wallet/i })).toBeVisible();
    expect(screen.queryByText("Workspace content")).not.toBeInTheDocument();
  });

  it("falls back to the missing-wallet message when no EIP-1193 provider is available", () => {
    process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS =
      "0x1111111111111111111111111111111111111111";

    render(
      <GenLayerWalletProvider>
        <TrialGuard>
          <p>Workspace content</p>
        </TrialGuard>
      </GenLayerWalletProvider>,
    );

    expect(
      screen.getByText(/No EIP-1193 wallet was detected/i),
    ).toBeVisible();
    expect(screen.queryByText("Workspace content")).not.toBeInTheDocument();
  });
});
