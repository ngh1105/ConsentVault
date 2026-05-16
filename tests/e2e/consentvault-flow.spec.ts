import { expect, test } from "@playwright/test";

test("covers the consent vault flow from dashboard to receipt", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: /Review creator policies/i })).toBeVisible();
  await page.getByRole("link", { name: "Policy", exact: true }).click();
  await page.waitForURL("**/policy");
  await expect(page.getByRole("heading", { level: 1, name: /Shape the consent policy/i })).toBeVisible();

  await page.getByRole("link", { name: "New Case", exact: true }).click();
  await page.waitForURL("**/cases/new");
  await expect(page).toHaveURL(/\/cases\/new$/);
  await expect(page.getByRole("heading", { level: 1, name: /File a new dispute/i })).toBeVisible();
  await expect(page.getByLabel(/Suspicious content title/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Open draft case/i })).toBeVisible();

  await page.goto("/cases/case-voice-clone/evidence");
  await expect(page.getByRole("heading", { level: 1, name: "Voice clone dispute" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "URLs and notes" })).toBeVisible();

  await page.goto("/cases/case-voice-clone/trial");
  await expect(page.getByRole("heading", { level: 1, name: "Voice clone dispute" })).toBeVisible();
  await expect(page.getByText("Violation").first()).toBeVisible();
  await expect(page.getByText(/^95 \//).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Consensus breakdown" })).toBeVisible();

  await page.goto("/cases/case-voice-clone/receipt");
  await expect(page.getByRole("heading", { level: 1, name: "Voice clone dispute" })).toBeVisible();
  await expect(page.getByLabel("Final verdict banner")).toContainText("Violation");
  await expect(page.getByText("95", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Validator summary" })).toBeVisible();
});
