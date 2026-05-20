import { expect, test } from "@playwright/test";

test("covers the consent vault flow from dashboard to receipt", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: /Review creator policies/i })).toBeVisible();
  await page.getByRole("link", { name: "Policy", exact: true }).click();
  await page.waitForURL("**/policy");
  await expect(page.getByRole("heading", { level: 1, name: /Creator policy/i })).toBeVisible();

  await page.getByRole("link", { name: "New case", exact: true }).click();
  await page.waitForURL("**/cases/new");
  await expect(page).toHaveURL(/\/cases\/new$/);
  await expect(page.getByRole("heading", { level: 1, name: /New case/i })).toBeVisible();
  await expect(page.getByLabel(/Suspicious content title/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Open draft case/i })).toBeVisible();

  await page.goto("/cases/case-voice-clone/evidence");
  await expect(page.getByRole("heading", { level: 1, name: "Voice clone dispute" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Original record versus generated output/i }),
  ).toBeVisible();

  await page.goto("/cases/case-voice-clone/trial");
  // TrialGuard may intercept the workspace when the live GenLayer engine is
  // wired but contract/wallet are unset in the local env.
  const trialWorkspaceHeading = page.getByRole("heading", { level: 1, name: "Voice clone dispute" });
  const trialGuardHeading = page.getByRole("heading", {
    name: /(GenLayer contract not configured|Connect wallet to run the GenLayer trial)/i,
  });
  await expect(trialWorkspaceHeading.or(trialGuardHeading).first()).toBeVisible();
  if ((await trialWorkspaceHeading.count()) > 0) {
    await expect(page.getByRole("heading", { name: "Violation" }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Validator breakdown" })).toBeVisible();
  }

  await page.goto("/cases/case-voice-clone/receipt");
  // Receipt route h1 is the verdict from VerdictBanner; the case title appears
  // in the eyebrow ("Verdict for ...").
  await expect(page.getByRole("heading", { level: 1, name: "Violation" })).toBeVisible();
  await expect(page.getByText("Verdict for Voice clone dispute")).toBeVisible();
  await expect(page.getByText("95", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Receipt metadata" })).toBeVisible();
});
