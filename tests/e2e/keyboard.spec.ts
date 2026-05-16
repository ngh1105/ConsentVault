import { expect, test, type Locator, type Page } from "@playwright/test";

async function pressTabUntilFocused(page: Page, target: Locator, maxTabs = 12) {
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

    const newCaseIntakeLink = page.getByRole("link", { name: /New case intake/i });
    const dashboardLink = page.getByRole("link", { name: "Dashboard", exact: true });
    const policyLink = page.getByRole("link", { name: "Policy", exact: true });
    const newCaseNavLink = page.getByRole("link", { name: "New Case", exact: true });

    await pressTabUntilFocused(page, newCaseIntakeLink);
    await expect(newCaseIntakeLink).toBeFocused();
    await expect(newCaseIntakeLink).toHaveAttribute("href", "/cases/new");

    await page.keyboard.press("Tab");
    await expect(dashboardLink).toBeFocused();
    await expect(dashboardLink).toHaveAttribute("href", "/");

    await page.keyboard.press("Tab");
    await expect(policyLink).toBeFocused();
    await expect(policyLink).toHaveAttribute("href", "/policy");

    await page.keyboard.press("Tab");
    await expect(newCaseNavLink).toBeFocused();
    await expect(newCaseNavLink).toHaveAttribute("href", "/cases/new");
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

    await expect(page.getByRole("link", { name: /New case intake/i })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();

    await page.getByRole("link", { name: /Open case/i }).first().click();
    await expect(page).toHaveURL(/\/cases\//);

    const evidenceWorkspaceLink = page.getByRole("link", { name: "Evidence workspace", exact: true });
    await expect(evidenceWorkspaceLink).toBeVisible();
    await expect(evidenceWorkspaceLink).toHaveAttribute("href", /\/cases\/[^/]+\/evidence$/);
  });
});
