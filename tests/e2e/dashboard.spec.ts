import { expect, test } from "@playwright/test";

test("dashboard exposes the main workflow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /Review creator policies/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Create case/i })).toBeVisible();
  await expect(page.getByText(/\d+ cases verdict-ready/i)).toBeVisible();
  await expect(page.locator("article").filter({ hasText: "Verdict Ready" }).first()).toBeVisible();
  await page.getByRole("link", { name: /Open case/i }).first().click();
  await page.waitForURL("**/cases/*");
  await expect(page).toHaveURL(/\/cases\//);
});
