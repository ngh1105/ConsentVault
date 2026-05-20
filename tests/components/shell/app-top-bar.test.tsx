import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppTopBar } from "@/components/shell/app-top-bar";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "system", setTheme: vi.fn() }),
}));

vi.mock("@/components/wallet/wallet-connect-button", () => ({
  WalletConnectButton: () => <button type="button">Connect wallet</button>,
}));

describe("AppTopBar", () => {
  it("closes the mobile menu on Escape and returns focus to the trigger", () => {
    render(<AppTopBar />);

    const trigger = screen.getByLabelText(/Open navigation/i);
    const details = trigger.closest("details");
    expect(details).not.toBeNull();

    fireEvent.click(trigger);
    expect(details).toHaveAttribute("open");

    fireEvent.keyDown(details as HTMLDetailsElement, { key: "Escape" });

    expect(details).not.toHaveAttribute("open");
    expect(trigger).toHaveFocus();
  });
});
