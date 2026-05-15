import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const siteShellSource = readFileSync(resolve(__dirname, "site-shell.tsx"), "utf8");
const navigationSource = readFileSync(resolve(__dirname, "navigation.tsx"), "utf8");
const homePageSource = readFileSync(resolve(__dirname, "../app/page.tsx"), "utf8");
const caseOverviewSource = readFileSync(
  resolve(__dirname, "./cases/case-overview.tsx"),
  "utf8",
);

describe("dashboard shell and case overview", () => {
  it("renders primary navigation with real workflow destinations", () => {
    expect(siteShellSource).toContain("<Navigation />");
    expect(navigationSource).toContain('<nav aria-label="Primary"');
    expect(navigationSource).toContain('href: "/"');
    expect(navigationSource).toContain('href: "/policy"');
    expect(navigationSource).toContain('href: "/cases/new"');
    expect(siteShellSource).toContain('href="/cases/new"');
  });

  it("wires the home page to the real dashboard screen and case overview links", () => {
    expect(homePageSource).toContain("<DashboardScreen />");
    expect(homePageSource).not.toContain("Task 1 scaffold");
    expect(caseOverviewSource).toContain('href={`/cases/${consentCase.id}/evidence`}');
    expect(caseOverviewSource).toContain('href={`/cases/${consentCase.id}/trial`}');
    expect(caseOverviewSource).toContain('href={`/cases/${consentCase.id}/receipt`}');
  });
});
