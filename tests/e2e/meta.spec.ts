import { expect, test } from "@playwright/test";

test("homepage exposes Open Graph + Twitter card metadata", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    /ConsentVault/i,
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    /verdict|consent/i,
  );
  await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute(
    "content",
    /opengraph-image/,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
});

test("opengraph-image route returns a PNG", async ({ request }) => {
  const response = await request.get("/opengraph-image");
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toMatch(/image\/png/);
});
