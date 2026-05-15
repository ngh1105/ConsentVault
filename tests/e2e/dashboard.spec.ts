import { expect, test } from "@playwright/test";

test("dashboard exposes the main workflow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "ConsentVault" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Create case/i })).toBeVisible();
  await expect(page.getByText("Verdict Ready")).toBeVisible();
  await page.getByRole("link", { name: /Open case/i }).first().click();
  await expect(page).toHaveURL(/\/cases\//);
});
