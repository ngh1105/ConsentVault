import { test } from "@playwright/test";
import * as path from "node:path";

const screenshotsDir = path.resolve(__dirname, "..", "..", "docs", "screenshots", "light");

const captures = [
  { file: "01-dashboard.png", path: "/", waitFor: "Review creator policies" },
  { file: "02-policy.png", path: "/policy", waitFor: "Creator policy" },
  { file: "03-new-case.png", path: "/cases/new", waitFor: "New case" },
  {
    file: "04-case-overview.png",
    path: "/cases/case-voice-clone",
    waitFor: "Voice clone dispute",
  },
  {
    file: "05-evidence.png",
    path: "/cases/case-voice-clone/evidence",
    waitFor: "Voice clone dispute",
  },
  {
    file: "06-trial.png",
    path: "/cases/case-voice-clone/trial",
    waitFor: "Voice clone dispute",
  },
  {
    file: "07-receipt.png",
    path: "/cases/case-voice-clone/receipt",
    waitFor: "Violation",
  },
] as const;

test.describe("demo screenshots (light)", () => {
  test.skip(
    !process.env.DEMO_CAPTURE,
    "Set DEMO_CAPTURE=1 (or run npm run demo:capture) to regenerate screenshots.",
  );
  test.use({
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
  });

  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      try {
        window.localStorage.setItem("theme", "light");
      } catch {}
    });
  });

  for (const capture of captures) {
    test(`captures ${capture.file}`, async ({ page }) => {
      await page.goto(capture.path);
      await page.getByRole("heading", { name: capture.waitFor }).first().waitFor();
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: path.join(screenshotsDir, capture.file),
        fullPage: true,
      });
    });
  }
});
