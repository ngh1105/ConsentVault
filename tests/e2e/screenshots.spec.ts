import { test } from "@playwright/test";
import * as path from "node:path";

const screenshotsDir = path.resolve(__dirname, "..", "..", "docs", "screenshots");

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
    waitFor: /Connect wallet to run the GenLayer trial|GenLayer contract not configured|Voice clone dispute/,
  },
  {
    file: "07-receipt.png",
    path: "/cases/case-voice-clone/receipt",
    waitFor: "Violation",
  },
] as const;

test.describe("demo screenshots", () => {
  test.skip(
    !process.env.DEMO_CAPTURE,
    "Set DEMO_CAPTURE=1 (or run npm run demo:capture) to regenerate screenshots.",
  );
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const capture of captures) {
    test(`captures ${capture.file}`, async ({ page }) => {
      await page.goto(capture.path);
      await page.getByRole("heading", { name: capture.waitFor }).first().waitFor();
      // Let auto-running effects (trial workspace) settle so the screenshot
      // shows the populated content rather than a spinner.
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: path.join(screenshotsDir, capture.file),
        fullPage: true,
      });
    });
  }
});
