import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", name: "dashboard" },
  { path: "/policy", name: "policy builder" },
  { path: "/cases/new", name: "new case intake" },
  { path: "/cases/case-voice-clone", name: "case overview" },
  { path: "/cases/case-voice-clone/evidence", name: "evidence workspace" },
  { path: "/cases/case-voice-clone/trial", name: "trial workspace" },
  { path: "/cases/case-voice-clone/receipt", name: "verdict receipt" },
] as const;

for (const route of routes) {
  test(`axe: ${route.path} (${route.name}) has no critical or serious accessibility violations`, async ({
    page,
  }) => {
    await page.goto(route.path);

    // Make sure the page is fully hydrated and any auto-running effects settle.
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const blocking = results.violations.filter(
      (violation) => violation.impact === "critical" || violation.impact === "serious",
    );

    expect(
      blocking,
      `Accessibility violations on ${route.path}:\n${JSON.stringify(blocking, null, 2)}`,
    ).toEqual([]);
  });
}
