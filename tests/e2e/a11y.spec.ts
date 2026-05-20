import { expect, test } from "@playwright/test";

const workflowPages = [
  {
    path: "/",
    heading: /Review creator policies/i,
    workflowControl: { role: "link" as const, name: /Create case/i },
  },
  {
    path: "/policy",
    heading: /Creator policy/i,
    workflowControl: { role: "button" as const, name: /Save policy/i },
  },
  {
    path: "/cases/new",
    heading: /New case/i,
    workflowControl: { role: "button" as const, name: /Open draft case/i },
  },
  {
    path: "/cases/case-voice-clone/evidence",
    heading: "Voice clone dispute",
    workflowControl: { role: "link" as const, name: /Back to case overview/i },
  },
  {
    path: "/cases/case-voice-clone/trial",
    heading: "Voice clone dispute",
    workflowControl: { role: "button" as const, name: /Re-run trial/i },
  },
  {
    path: "/cases/case-voice-clone/receipt",
    heading: /Violation/i,
    workflowControl: { role: "link" as const, name: /Back to case overview/i },
  },
] as const;

for (const workflowPage of workflowPages) {
  test(`${workflowPage.path} exposes a single top-level heading and a visible focus state`, async ({ page }) => {
    await page.goto(workflowPage.path);

    if (workflowPage.path === "/cases/case-voice-clone/trial") {
      // The live GenLayer engine may render TrialGuard's EmptyState instead of
      // the workspace when the contract address or wallet is missing in the
      // local e2e env. Accept either entry point.
      const workspaceHeading = page.getByRole("heading", { level: 1, name: workflowPage.heading });
      const guardHeading = page.getByRole("heading", {
        name: /(GenLayer contract not configured|Connect wallet to run the GenLayer trial)/i,
      });
      await expect(workspaceHeading.or(guardHeading).first()).toBeVisible();

      if ((await workspaceHeading.count()) === 0) {
        return;
      }
    } else {
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1, name: workflowPage.heading })).toBeVisible();
    }

    const control = page.getByRole(workflowPage.workflowControl.role, {
      name: workflowPage.workflowControl.name,
    });

    await expect(control).toBeVisible();
    if (
      workflowPage.path === "/cases/case-voice-clone/receipt" ||
      workflowPage.path === "/cases/case-voice-clone/trial"
    ) {
      await expect(control).toBeEnabled({ timeout: 15_000 });
    }
    await control.focus();
    await expect(control).toBeFocused();

    const outlineWidth = await control.evaluate((element) => getComputedStyle(element).outlineWidth);

    expect(outlineWidth).not.toBe("0px");
  });
}

test("workflow navigation and evidence links expose clear accessible names", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Dashboard", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Policy", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "New case", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Create case/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open case/i }).first()).toBeVisible();

  await page.goto("/cases/case-voice-clone/evidence");
  await expect(page.getByRole("link", { name: "Back to case overview" })).toBeVisible();

  const sourceUrlLink = page.locator('a[href="https://creator.example/mara/original-podcast"]').first();
  await expect(sourceUrlLink).toBeVisible();

  const aiOutputLink = page.locator('a[href="https://ai.example/renders/voice-clone"]').first();
  await expect(aiOutputLink).toBeVisible();

  const platformLink = page.locator('a[href="https://platform.example/posts/mara-endorsement"]').first();
  await expect(platformLink).toBeVisible();
});

test("receipt route hydrates without persisted receipt mismatches", async ({ page }) => {
  await page.addInitScript(() => {
    const persisted = {
      policies: [
        {
          id: "policy-persisted",
          creatorName: "Persisted Creator",
          creatorHandle: "@persisted",
          allowedUses: ["Commentary"],
          blockedUses: ["Voice clone"],
          attributionRules: "Credit required.",
          licenseRules: "License required.",
          jurisdictionNote: "Global",
          createdAt: "2026-05-15T00:00:00.000Z",
        },
      ],
      cases: [
        {
          id: "case-voice-clone",
          title: "Voice clone dispute",
          status: "Verdict Ready",
          policyId: "policy-persisted",
          sourceUrl: "https://creator.example/source",
          aiOutputUrl: "https://ai.example/output",
          platformUrl: "https://platform.example/post",
          notes: "Persisted dispute notes",
          originalContent: "Original voice performance",
          aiOutput: "Synthetic ad read",
          evidenceItems: [
            {
              id: "ev-persisted",
              type: "source",
              title: "Persisted evidence",
              url: "https://creator.example/source",
              description: "Persisted source evidence",
              capturedAt: "2026-05-15T00:00:00.000Z",
            },
          ],
          createdAt: "2026-05-15T00:00:00.000Z",
        },
      ],
      receipts: [
        {
          id: "receipt-persisted",
          caseId: "case-voice-clone",
          finalVerdict: "Violation",
          score: 92,
          summary: "Persisted receipt summary",
          recommendedAction: "Persisted next action",
          judgments: [
            {
              id: "judgment-persisted",
              validatorName: "Persisted Validator",
              verdict: "Violation",
              confidence: 0.92,
              reasoning: "Persisted reasoning",
              citedEvidenceIds: ["ev-persisted"],
            },
          ],
          createdAt: "2026-05-15T00:00:00.000Z",
        },
      ],
      activeCaseId: "case-voice-clone",
    };

    window.localStorage.setItem("consentvault.state", JSON.stringify(persisted));
  });

  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });

  await page.goto("/cases/case-voice-clone/receipt");
  await expect(page.getByRole("heading", { level: 1, name: "Violation" })).toBeVisible();
  await expect(page.getByText("Verdict for Voice clone dispute")).toBeVisible();
  await expect(page.getByText("92", { exact: true }).first()).toBeVisible();

  await expect.poll(() => errors.some((message) => message.includes("Hydration failed")), {
    timeout: 1_500,
  }).toBe(false);
});
