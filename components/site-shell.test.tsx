import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CaseOverview } from "@/components/cases/case-overview";
import { ConsentVaultProvider } from "@/components/providers/consent-vault-provider";
import { GenLayerWalletProvider } from "@/components/providers/genlayer-wallet-provider";
import { Navigation } from "@/components/navigation";
import { SiteShell } from "@/components/site-shell";
import { sampleCases } from "@/lib/sample-data";
import { usePathname } from "next/navigation";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

const mockedUsePathname = vi.mocked(usePathname);
const originalPlaywrightPort = process.env.PLAYWRIGHT_PORT;
const originalPlaywrightHost = process.env.PLAYWRIGHT_HOST;

async function loadPlaywrightConfig() {
  vi.resetModules();
  return (await import("../playwright.config")).default;
}

afterEach(() => {
  cleanup();
  mockedUsePathname.mockReset();
  vi.restoreAllMocks();

  if (originalPlaywrightPort === undefined) {
    delete process.env.PLAYWRIGHT_PORT;
  } else {
    process.env.PLAYWRIGHT_PORT = originalPlaywrightPort;
  }

  if (originalPlaywrightHost === undefined) {
    delete process.env.PLAYWRIGHT_HOST;
  } else {
    process.env.PLAYWRIGHT_HOST = originalPlaywrightHost;
  }
});

describe("dashboard shell and case overview", () => {
  it("renders shell navigation, primary CTA, main content, and action rail", () => {
    mockedUsePathname.mockReturnValue("/");

    render(
      <GenLayerWalletProvider>
        <SiteShell>
          <p>Dashboard child content</p>
        </SiteShell>
      </GenLayerWalletProvider>,
    );

    expect(screen.getByRole("link", { name: /ConsentVault/i })).toBeVisible();
    expect(screen.getByRole("link", { name: /New case intake/i })).toHaveAttribute(
      "href",
      "/cases/new",
    );
    expect(screen.getByRole("button", { name: /Reload after install/i })).not.toBeDisabled();

    const primaryNav = screen.getByRole("navigation", { name: "Primary" });

    expect(within(primaryNav).getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(within(primaryNav).getByRole("link", { name: "Policy" })).toHaveAttribute(
      "href",
      "/policy",
    );
    expect(within(primaryNav).getByRole("link", { name: "New Case" })).toHaveAttribute(
      "href",
      "/cases/new",
    );
    expect(within(primaryNav).getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    expect(screen.getByText("Dashboard child content")).toBeVisible();
    expect(screen.getByText("Action rail")).toBeVisible();
    expect(screen.getByRole("heading", { name: /Keep each dispute moving/i })).toBeVisible();
  });

  it("marks nested case routes as active in navigation", () => {
    mockedUsePathname.mockReturnValue("/cases/new/intake");

    render(<Navigation />);

    expect(screen.getByRole("link", { name: "New Case" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByRole("link", { name: "Policy" })).not.toHaveAttribute("aria-current");
  });

  it("renders case overview workflow handoff links for the active case", () => {
    render(
      <ConsentVaultProvider>
        <CaseOverview caseId={sampleCases[0].id} />
      </ConsentVaultProvider>,
    );

    expect(screen.getByRole("heading", { name: sampleCases[0].title })).toBeVisible();
    expect(screen.getByRole("link", { name: "Evidence workspace" })).toHaveAttribute(
      "href",
      `/cases/${sampleCases[0].id}/evidence`,
    );
    expect(screen.getByRole("link", { name: "Trial view" })).toHaveAttribute(
      "href",
      `/cases/${sampleCases[0].id}/trial`,
    );
    expect(screen.getByRole("link", { name: "Receipt view" })).toHaveAttribute(
      "href",
      `/cases/${sampleCases[0].id}/receipt`,
    );
  });

  it("uses a stable local Playwright port by default and only reuses servers when requested", async () => {
    delete process.env.PLAYWRIGHT_PORT;
    delete process.env.PLAYWRIGHT_REUSE_SERVER;
    process.env.PLAYWRIGHT_HOST = "127.0.0.1";

    const defaultConfig = await loadPlaywrightConfig();
    const defaultWebServer = Array.isArray(defaultConfig.webServer)
      ? defaultConfig.webServer[0]
      : defaultConfig.webServer;

    expect(defaultConfig.use?.baseURL).toBe("http://127.0.0.1:3201");
    expect(defaultWebServer?.url).toBe(defaultConfig.use?.baseURL);
    expect(defaultWebServer?.command).toContain("--hostname 127.0.0.1 --port 3201");
    expect(defaultWebServer?.reuseExistingServer).toBe(false);

    process.env.PLAYWRIGHT_PORT = "4100";
    process.env.PLAYWRIGHT_REUSE_SERVER = "1";

    const overrideConfig = await loadPlaywrightConfig();
    const overrideWebServer = Array.isArray(overrideConfig.webServer)
      ? overrideConfig.webServer[0]
      : overrideConfig.webServer;

    expect(overrideConfig.use?.baseURL).toBe("http://127.0.0.1:4100");
    expect(overrideWebServer?.url).toBe("http://127.0.0.1:4100");
    expect(overrideWebServer?.command).toContain("--hostname 127.0.0.1 --port 4100");
    expect(overrideWebServer?.reuseExistingServer).toBe(true);
  });
});

