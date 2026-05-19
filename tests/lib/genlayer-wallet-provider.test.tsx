import * as React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GenLayerWalletProvider,
  useGenLayerWallet,
} from "@/components/providers/genlayer-wallet-provider";

type Listener = (...args: unknown[]) => void;

function createMockProvider() {
  const listeners = new Map<string, Set<Listener>>();
  const provider = {
    request: vi.fn<(args: { method: string }) => Promise<unknown>>(),
    on: vi.fn((event: string, listener: Listener) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(listener);
    }),
    removeListener: vi.fn((event: string, listener: Listener) => {
      listeners.get(event)?.delete(listener);
    }),
    emit: (event: string, payload: unknown) => {
      listeners.get(event)?.forEach((listener) => listener(payload));
    },
  };
  return provider;
}

function Probe() {
  const ctx = useGenLayerWallet();
  return (
    <div>
      <span data-testid="address">{ctx.address ?? "none"}</span>
      <span data-testid="chainId">{ctx.chainId ?? "none"}</span>
      <span data-testid="status">{ctx.status}</span>
      <span data-testid="error">{ctx.error ?? "none"}</span>
      <span data-testid="hasClient">{ctx.client ? "yes" : "no"}</span>
      <button onClick={() => void ctx.connect()}>connect</button>
    </div>
  );
}

describe("GenLayerWalletProvider", () => {
  let mockProvider: ReturnType<typeof createMockProvider>;

  beforeEach(() => {
    mockProvider = createMockProvider();
    Object.defineProperty(window, "ethereum", {
      configurable: true,
      value: mockProvider,
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    delete (window as { ethereum?: unknown }).ethereum;
  });

  async function connect(addresses: string[], chainHex: string) {
    mockProvider.request.mockImplementation(async ({ method }) => {
      if (method === "eth_requestAccounts") return addresses;
      if (method === "eth_chainId") return chainHex;
      throw new Error(`unexpected ${method}`);
    });
    render(
      <GenLayerWalletProvider>
        <Probe />
      </GenLayerWalletProvider>,
    );
    await act(async () => {
      screen.getByText("connect").click();
    });
  }

  it("rejects malformed addresses with status=error", async () => {
    await connect(["0xnothex"], "0xf22f");
    expect(screen.getByTestId("status").textContent).toBe("error");
    expect(screen.getByTestId("error").textContent).toContain("invalid address");
    expect(screen.getByTestId("hasClient").textContent).toBe("no");
  });

  it("rebuilds client and chainId on accountsChanged", async () => {
    const validA = "0x" + "a".repeat(40);
    const validB = "0x" + "b".repeat(40);
    await connect([validA], "0xf22f");
    expect(screen.getByTestId("address").textContent).toBe(validA);
    expect(screen.getByTestId("hasClient").textContent).toBe("yes");

    await act(async () => {
      mockProvider.emit("accountsChanged", [validB]);
    });
    expect(screen.getByTestId("address").textContent).toBe(validB);
    expect(screen.getByTestId("hasClient").textContent).toBe("yes");
  });

  it("rebuilds client on chainChanged", async () => {
    const validA = "0x" + "a".repeat(40);
    await connect([validA], "0xf22f");
    const beforeChainId = screen.getByTestId("chainId").textContent;

    await act(async () => {
      mockProvider.emit("chainChanged", "0xf230");
    });
    expect(screen.getByTestId("chainId").textContent).not.toBe(beforeChainId);
    expect(screen.getByTestId("hasClient").textContent).toBe("yes");
  });
});
