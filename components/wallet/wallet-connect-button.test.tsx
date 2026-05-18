import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GenLayerWalletProvider } from "@/components/providers/genlayer-wallet-provider";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(window, "ethereum");
});

function installEthereumMock(accounts: string[] = ["0x1234567890abcdef1234567890abcdef12345678"]) {
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
    value: {
      request,
      on: vi.fn(),
      removeListener: vi.fn(),
    },
  });

  return request;
}

describe("WalletConnectButton", () => {
  it("shows a reload action when no EIP-1193 provider exists", () => {
    render(
      <GenLayerWalletProvider>
        <WalletConnectButton />
      </GenLayerWalletProvider>,
    );

    const button = screen.getByRole("button", { name: /Reload after install/i });
    expect(button).not.toBeDisabled();
  });

  it("reloads the page when the missing-wallet button is clicked", async () => {
    const reload = vi.fn();
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, reload },
    });

    const user = userEvent.setup();

    try {
      render(
        <GenLayerWalletProvider>
          <WalletConnectButton />
        </GenLayerWalletProvider>,
      );

      await user.click(screen.getByRole("button", { name: /Reload after install/i }));
      expect(reload).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(window, "location", {
        configurable: true,
        value: originalLocation,
      });
    }
  });

  it("connects through the browser wallet and displays the GenLayer account", async () => {
    const request = installEthereumMock();
    const user = userEvent.setup();

    render(
      <GenLayerWalletProvider>
        <WalletConnectButton />
      </GenLayerWalletProvider>,
    );

    await user.click(screen.getByRole("button", { name: /Connect wallet/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /0x1234\.\.\.5678/i })).toBeVisible();
    });
    expect(screen.getByText(/Genlayer Studio Network/i)).toBeVisible();
    expect(request).toHaveBeenCalledWith({ method: "eth_requestAccounts" });
  });
});
