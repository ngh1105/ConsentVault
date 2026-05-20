import { expect, test, type Locator, type Page } from "@playwright/test";

async function pressTabUntilFocused(page: Page, target: Locator, maxTabs = 20) {
  for (let index = 0; index < maxTabs; index += 1) {
    await page.keyboard.press("Tab");

    if (await target.evaluate((element) => element === document.activeElement)) {
      return;
    }
  }

  throw new Error("Target element did not receive keyboard focus within the expected tab range.");
}

test.describe("keyboard accessibility and responsive shell flow", () => {
  test("tab navigation reaches the primary shell call-to-action and nav links", async ({ page }) => {
    await page.goto("/");

    const dashboardLink = page.getByRole("link", { name: "Dashboard", exact: true });
    const newCaseNavLink = page.getByRole("link", { name: "New case", exact: true });
    const policyNavLink = page.getByRole("link", { name: "Policy", exact: true });
    const heroCreateCaseLink = page.getByRole("link", { name: /Create case/i }).first();

    // Each primary control must be reachable by keyboard focus regardless of
    // exact tab order. The header nav comes before the hero in DOM order.
    await pressTabUntilFocused(page, dashboardLink);
    await expect(dashboardLink).toBeFocused();
    await expect(dashboardLink).toHaveAttribute("href", "/");

    await pressTabUntilFocused(page, newCaseNavLink);
    await expect(newCaseNavLink).toBeFocused();
    await expect(newCaseNavLink).toHaveAttribute("href", "/cases/new");

    await pressTabUntilFocused(page, policyNavLink);
    await expect(policyNavLink).toBeFocused();
    await expect(policyNavLink).toHaveAttribute("href", "/policy");

    await pressTabUntilFocused(page, heroCreateCaseLink);
    await expect(heroCreateCaseLink).toBeFocused();
    await expect(heroCreateCaseLink).toHaveAttribute("href", "/cases/new");
  });

  test("a case workflow link is reachable by keyboard focus", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Open case/i }).first().click();
    await expect(page).toHaveURL(/\/cases\//);

    const evidenceWorkspaceLink = page.getByRole("link", { name: "Evidence workspace", exact: true });

    await pressTabUntilFocused(page, evidenceWorkspaceLink, 20);
    await expect(evidenceWorkspaceLink).toBeFocused();
    await expect(evidenceWorkspaceLink).toHaveAttribute("href", /\/cases\/[^/]+\/evidence$/);
  });

  test("shell and workflow links remain usable on a narrow viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    // Primary desktop nav is hidden below md; the disclosure trigger and the
    // hero CTA are the keyboard-reachable entry points on narrow viewports.
    await expect(page.getByRole("link", { name: /Create case/i }).first()).toBeVisible();
    await expect(page.getByLabel("Open navigation")).toBeVisible();

    await page.getByRole("link", { name: /Open case/i }).first().click();
    await expect(page).toHaveURL(/\/cases\//);

    const evidenceWorkspaceLink = page.getByRole("link", { name: "Evidence workspace", exact: true });
    await expect(evidenceWorkspaceLink).toBeVisible();
    await expect(evidenceWorkspaceLink).toHaveAttribute("href", /\/cases\/[^/]+\/evidence$/);
  });
});
