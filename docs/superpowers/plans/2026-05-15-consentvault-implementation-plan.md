# ConsentVault Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished ConsentVault Hybrid MVP that lets a creator define a consent policy, submit a suspicious AI output, compare evidence, run a simulated GenLayer-style trial, and export a shareable verdict receipt.

**Architecture:** This is a Next.js App Router app with thin route files, a shared client-side store backed by `localStorage`, and pure domain logic under `lib/` for the policy, evidence, and verdict pipeline. The UI should feel like a legal evidence archive: warm parchment surfaces, deep ink text, scarlet verdict accents, and monospaced metadata labels. That visual system should be implemented once in the root shell and reused across every screen so the demo feels cohesive instead of like separate pages.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, lucide-react, Vitest, Testing Library, Playwright.

---

## File Map

These are the main units the implementation will create or modify:

- `app/layout.tsx` — loads fonts, global metadata, and the ConsentVault provider/shell.
- `app/globals.css` — design tokens, gradients, grain overlay, focus states, and global typography.
- `app/page.tsx` — dashboard route.
- `app/policy/page.tsx` — policy builder route.
- `app/cases/new/page.tsx` — dispute intake route.
- `app/cases/[caseId]/page.tsx` — case overview hub.
- `app/cases/[caseId]/evidence/page.tsx` — evidence workspace.
- `app/cases/[caseId]/trial/page.tsx` — trial results route.
- `app/cases/[caseId]/receipt/page.tsx` — verdict receipt route.
- `components/providers/consent-vault-provider.tsx` — app-wide client store provider.
- `components/site-shell.tsx` — overall layout, header, nav, and content frame.
- `components/navigation.tsx` — route navigation.
- `components/dashboard/*` — dashboard cards, filters, and status pills.
- `components/policy/*` — policy form and helper UI.
- `components/intake/*` — dispute submission form and evidence preview.
- `components/evidence/*` — side-by-side comparison, applicable clauses, and timeline.
- `components/trial/*` — validator cards, consensus meter, and trial controls.
- `components/receipt/*` — final receipt, export, and sharing actions.
- `lib/domain.ts` — core types.
- `lib/sample-data.ts` — seed policies, cases, evidence, judgments, and receipts.
- `lib/storage.ts` — JSON serialization helpers for persistence.
- `lib/store.tsx` — reducer, selectors, and hook API.
- `lib/policy.ts` — policy draft helpers and normalization.
- `lib/case-intake.ts` — intake-to-case mapping helpers.
- `lib/evidence.ts` — evidence/policy matching helpers.
- `lib/trial-engine.ts` — trial engine interface.
- `lib/mock-trial-engine.ts` — deterministic mock GenLayer-style engine.
- `lib/verdict.ts` — consensus and receipt helpers.
- `lib/export.ts` — JSON download/share helpers.
- `tests/lib/*.test.ts` — unit coverage for the pure modules.
- `tests/e2e/*.spec.ts` — browser verification for the end-to-end flow.

---

## Phase 1: Scaffold and foundation

### Task 1: Bootstrap the app shell and styling system

**Files:**
- Create: `package.json`
- Create: `next.config.mjs`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `components.json`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/page.tsx`
- Create: `components/site-shell.tsx`

- [ ] **Step 1: Create the Next.js app and install the UI stack**

```bash
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir false --import-alias "@/*" --use-npm
npm install lucide-react class-variance-authority clsx tailwind-merge date-fns
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom playwright @playwright/test
npx shadcn@latest init
npx shadcn@latest add button card dialog tabs badge separator input textarea label select table tooltip scroll-area sheet dropdown-menu accordion
```

- [ ] **Step 2: Wire the root layout with distinctive fonts and the app shell**

```tsx
import { Cormorant_Garamond, IBM_Plex_Mono } from "next/font/google";
import { ConsentVaultProvider } from "@/components/providers/consent-vault-provider";
import { SiteShell } from "@/components/site-shell";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});
```

Add `metadata` for `ConsentVault`, wrap `<body>` with `ConsentVaultProvider`, and render `SiteShell` around `children`.

- [ ] **Step 3: Define the global visual system in `app/globals.css`**

Use CSS variables for the parchment/ink/scarlet palette, a subtle grain overlay, strong `:focus-visible` styles, and reusable utility classes for verdict banners, evidence cards, and mono metadata labels.

```css
:root {
  --background: 42 35% 96%;
  --foreground: 225 30% 11%;
  --card: 42 30% 98%;
  --card-foreground: 225 30% 11%;
  --muted: 42 12% 90%;
  --muted-foreground: 225 10% 38%;
  --accent: 356 70% 43%;
  --accent-foreground: 0 0% 100%;
}
```

- [ ] **Step 4: Render a minimal landing dashboard shell in `app/page.tsx`**

The first page should already prove the app chrome works: brand mark, navigation, primary CTA, and a sample case grid placeholder.

- [ ] **Step 5: Run the scaffold checks and commit**

Run:
```bash
npm run build
npm run lint
```
Expected: both pass once the scaffold and layout are wired.

Commit:
```bash
git add package.json next.config.mjs tsconfig.json postcss.config.mjs tailwind.config.ts components.json app/layout.tsx app/globals.css app/page.tsx components/site-shell.tsx
git commit -m "feat: bootstrap ConsentVault app shell"
```

---

### Task 2: Add the domain model, seed data, and persistent store

**Files:**
- Create: `lib/domain.ts`
- Create: `lib/sample-data.ts`
- Create: `lib/storage.ts`
- Create: `lib/store.tsx`
- Create: `components/providers/consent-vault-provider.tsx`
- Create: `tests/lib/domain.test.ts`
- Create: `tests/lib/store.test.ts`
- Create: `tests/setup.ts`
- Create: `vitest.config.ts`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Write the failing unit tests for the core state shape**

```ts
import { describe, expect, it } from "vitest";
import {
  consentVaultReducer,
  createInitialConsentVaultState,
  deserializeConsentVaultState,
  serializeConsentVaultState,
} from "@/lib/store";
import { sampleCases } from "@/lib/sample-data";

describe("consentVaultReducer", () => {
  it("creates a draft case from an intake submission", () => {
    const state = createInitialConsentVaultState();
    const next = consentVaultReducer(state, {
      type: "case/create",
      payload: {
        title: "Voice clone dispute",
        sourceUrl: "https://creator.example/source",
        aiOutputUrl: "https://platform.example/output",
        platformUrl: "https://platform.example/post",
        notes: "Suspicious synthetic voice reuse",
        policyId: sampleCases[0].policyId,
      },
    });

    expect(next.cases[0].status).toBe("Draft");
    expect(next.activeCaseId).toBe(next.cases[0].id);
  });

  it("round-trips through JSON persistence", () => {
    const state = createInitialConsentVaultState();
    expect(deserializeConsentVaultState(serializeConsentVaultState(state))).toEqual(state);
  });
});
```

- [ ] **Step 2: Run the tests and confirm they fail until the modules exist**

Run:
```bash
npx vitest run tests/lib/domain.test.ts tests/lib/store.test.ts
```
Expected: module-not-found / undefined-function failures until the state layer exists.

- [ ] **Step 3: Implement the shared types, seed data, and reducer**

Define these exact types in `lib/domain.ts`:

```ts
export type CaseStatus = "Draft" | "In Review" | "Verdict Ready";
export type VerdictCategory =
  | "Allowed"
  | "Needs Attribution"
  | "Needs License"
  | "Impersonation Risk"
  | "Violation";

export interface ConsentPolicy {
  id: string;
  creatorName: string;
  creatorHandle: string;
  allowedUses: string[];
  blockedUses: string[];
  attributionRules: string;
  licenseRules: string;
  jurisdictionNote: string;
  createdAt: string;
}

export interface EvidenceItem {
  id: string;
  type: "source" | "output" | "platform" | "note" | "policy";
  title: string;
  url: string;
  description: string;
  capturedAt: string;
}

export interface ConsentCase {
  id: string;
  title: string;
  status: CaseStatus;
  policyId: string;
  sourceUrl: string;
  aiOutputUrl: string;
  platformUrl: string;
  notes: string;
  originalContent: string;
  aiOutput: string;
  evidenceItems: EvidenceItem[];
  createdAt: string;
}

export interface ValidatorJudgment {
  id: string;
  validatorName: string;
  verdict: VerdictCategory;
  confidence: number;
  reasoning: string;
  citedEvidenceIds: string[];
}

export interface VerdictReceipt {
  id: string;
  caseId: string;
  finalVerdict: VerdictCategory;
  score: number;
  summary: string;
  recommendedAction: string;
  judgments: ValidatorJudgment[];
  createdAt: string;
}

export interface ConsentVaultState {
  policies: ConsentPolicy[];
  cases: ConsentCase[];
  receipts: VerdictReceipt[];
  activeCaseId: string;
}
```

Use `lib/sample-data.ts` to seed at least four cases that demonstrate different verdict categories, plus at least two policies with distinct blocked-use lists.

Keep the reducer small and explicit in `lib/store.tsx`:

```ts
export type ConsentVaultAction =
  | { type: "policy/save"; payload: ConsentPolicy }
  | { type: "case/create"; payload: CaseSubmission }
  | { type: "case/update"; payload: ConsentCase }
  | { type: "receipt/save"; payload: VerdictReceipt }
  | { type: "activeCase/set"; payload: string };
```

- [ ] **Step 4: Add the provider and localStorage helpers**

`components/providers/consent-vault-provider.tsx` should load initial state from `localStorage` on the client, fall back to `createInitialConsentVaultState()`, and expose a `useConsentVault()` hook plus selectors for cases, policies, and receipts.

- [ ] **Step 5: Re-run the tests, build, and commit**

Run:
```bash
npx vitest run tests/lib/domain.test.ts tests/lib/store.test.ts
npm run build
```
Expected: both commands pass once the domain and store are implemented.

Commit:
```bash
git add lib/domain.ts lib/sample-data.ts lib/storage.ts lib/store.tsx components/providers/consent-vault-provider.tsx tests/setup.ts vitest.config.ts tests/lib/domain.test.ts tests/lib/store.test.ts app/layout.tsx
git commit -m "feat: add consent vault state and seed data"
```

---

## Phase 2: Core demo flow

### Task 3: Build the dashboard shell and case overview

**Files:**
- Create: `components/brand-mark.tsx`
- Create: `components/navigation.tsx`
- Create: `components/site-shell.tsx`
- Create: `components/dashboard/dashboard-screen.tsx`
- Create: `components/dashboard/case-card.tsx`
- Create: `components/dashboard/status-pill.tsx`
- Create: `components/cases/case-overview.tsx`
- Create: `app/cases/[caseId]/page.tsx`
- Modify: `app/page.tsx`
- Test: `tests/e2e/dashboard.spec.ts`

- [ ] **Step 1: Write the browser smoke test for the dashboard**

```ts
import { expect, test } from "@playwright/test";

test("dashboard exposes the main workflow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "ConsentVault" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Create case/i })).toBeVisible();
  await expect(page.getByText("Verdict Ready")).toBeVisible();
  await page.getByRole("link", { name: /Open case/i }).first().click();
  await expect(page).toHaveURL(/\/cases\//);
});
```

- [ ] **Step 2: Run the browser test and confirm it fails until the shell exists**

Run:
```bash
npx playwright test tests/e2e/dashboard.spec.ts
```
Expected: route/navigation failures until the dashboard shell and overview route are implemented.

- [ ] **Step 3: Implement the shared shell and dashboard cards**

`SiteShell` should provide the header, top-level nav, content frame, and a clear action rail. `DashboardScreen` should surface the sample cases, their status pills, and a primary action to create a new case.

- [ ] **Step 4: Add a lightweight case overview route**

`app/cases/[caseId]/page.tsx` should be a hub with case metadata, policy summary, and direct links to evidence, trial, and receipt screens.

- [ ] **Step 5: Re-run the browser test, build, and commit**

Run:
```bash
npx playwright test tests/e2e/dashboard.spec.ts
npm run build
```
Expected: dashboard smoke test passes and the project still builds.

Commit:
```bash
git add components/brand-mark.tsx components/navigation.tsx components/site-shell.tsx components/dashboard/dashboard-screen.tsx components/dashboard/case-card.tsx components/dashboard/status-pill.tsx components/cases/case-overview.tsx app/page.tsx app/cases/[caseId]/page.tsx tests/e2e/dashboard.spec.ts
git commit -m "feat: add dashboard and case navigation"
```

---

### Task 4: Build the consent policy builder

**Files:**
- Create: `components/policy/policy-builder-screen.tsx`
- Create: `components/policy/policy-form.tsx`
- Create: `components/policy/use-policy-draft.ts`
- Create: `lib/policy.ts`
- Create: `app/policy/page.tsx`
- Create: `tests/lib/policy.test.ts`
- Modify: `components/navigation.tsx` if the nav needs a policy entry

- [ ] **Step 1: Write the failing policy helper tests**

```ts
import { describe, expect, it } from "vitest";
import { normalizeBlockedUses, savePolicyDraft } from "@/lib/policy";

describe("normalizeBlockedUses", () => {
  it("splits comma-separated input into trimmed unique clauses", () => {
    expect(normalizeBlockedUses("voice clone, impersonation, remix, voice clone")).toEqual([
      "voice clone",
      "impersonation",
      "remix",
    ]);
  });
});
```

- [ ] **Step 2: Run the policy tests and confirm they fail**

Run:
```bash
npx vitest run tests/lib/policy.test.ts
```
Expected: helper-not-found failures until the policy module exists.

- [ ] **Step 3: Implement the policy form and draft helpers**

The form should edit `creatorName`, `creatorHandle`, `allowedUses`, `blockedUses`, `attributionRules`, `licenseRules`, and `jurisdictionNote`. Keep blocked uses as chips or tag input, not a freeform paragraph.

- [ ] **Step 4: Connect the policy builder to the shared store**

Saving the form should update the active policy in the provider and keep the dashboard summary in sync.

- [ ] **Step 5: Re-run the tests, build, and commit**

Run:
```bash
npx vitest run tests/lib/policy.test.ts
npm run build
```
Expected: policy helper tests pass and the app still builds.

Commit:
```bash
git add components/policy/policy-builder-screen.tsx components/policy/policy-form.tsx components/policy/use-policy-draft.ts lib/policy.ts app/policy/page.tsx tests/lib/policy.test.ts components/navigation.tsx
git commit -m "feat: add consent policy builder"
```

---

### Task 5: Build dispute intake and evidence bundle preview

**Files:**
- Create: `components/intake/case-intake-screen.tsx`
- Create: `components/intake/intake-form.tsx`
- Create: `components/intake/evidence-bundle-preview.tsx`
- Create: `lib/case-intake.ts`
- Create: `app/cases/new/page.tsx`
- Create: `tests/lib/case-intake.test.ts`

- [ ] **Step 1: Write the failing intake helper tests**

```ts
import { describe, expect, it } from "vitest";
import { buildEvidenceBundlePreview } from "@/lib/case-intake";

describe("buildEvidenceBundlePreview", () => {
  it("turns intake fields into source, output, and platform evidence cards", () => {
    const bundle = buildEvidenceBundlePreview({
      title: "Voice clone dispute",
      sourceUrl: "https://creator.example/source",
      aiOutputUrl: "https://platform.example/output",
      platformUrl: "https://platform.example/post",
      notes: "Suspicious synthetic voice reuse",
    });

    expect(bundle.map((item) => item.type)).toEqual(["source", "output", "platform"]);
    expect(bundle[0].url).toContain("creator.example");
  });
});
```

- [ ] **Step 2: Run the intake tests and confirm they fail**

Run:
```bash
npx vitest run tests/lib/case-intake.test.ts
```
Expected: helper-not-found failures until the intake module exists.

- [ ] **Step 3: Implement the intake screen and bundle preview**

The intake form should capture the suspicious content title, original source URL, AI output URL, platform URL, and notes. The preview should show exactly three evidence cards before submission so the user can verify what will be filed.

- [ ] **Step 4: Wire intake submission into the shared store**

Submitting the form should create a new draft case, populate its evidence items, mark it as the active case, and route to the case overview page.

- [ ] **Step 5: Re-run the tests, build, and commit**

Run:
```bash
npx vitest run tests/lib/case-intake.test.ts
npm run build
```
Expected: intake tests pass and the app still builds.

Commit:
```bash
git add components/intake/case-intake-screen.tsx components/intake/intake-form.tsx components/intake/evidence-bundle-preview.tsx lib/case-intake.ts app/cases/new/page.tsx tests/lib/case-intake.test.ts
git commit -m "feat: add dispute intake flow"
```

---

### Task 6: Build the evidence workspace

**Files:**
- Create: `components/evidence/evidence-workspace-screen.tsx`
- Create: `components/evidence/comparison-panel.tsx`
- Create: `components/evidence/policy-clause-list.tsx`
- Create: `components/evidence/evidence-timeline.tsx`
- Create: `lib/evidence.ts`
- Create: `app/cases/[caseId]/evidence/page.tsx`
- Create: `tests/lib/evidence.test.ts`

- [ ] **Step 1: Write the failing evidence-matching test**

```ts
import { describe, expect, it } from "vitest";
import { matchPolicyClauses } from "@/lib/evidence";
import { sampleCases, samplePolicies } from "@/lib/sample-data";

describe("matchPolicyClauses", () => {
  it("returns the blocked clauses that match the selected case", () => {
    const matches = matchPolicyClauses(sampleCases[0], samplePolicies[0]);
    expect(matches).toContain("impersonation");
    expect(matches).not.toContain("commercial remix");
  });
});
```

- [ ] **Step 2: Run the evidence tests and confirm they fail**

Run:
```bash
npx vitest run tests/lib/evidence.test.ts
```
Expected: helper-not-found failures until the evidence module exists.

- [ ] **Step 3: Implement the split-screen evidence workspace**

The workspace should show original content and AI output side by side on desktop, collapse to tabs on mobile, and keep the applicable policy clauses visible in a sticky rail.

- [ ] **Step 4: Connect the workspace to the selected case and policy**

The route should resolve the active case by `caseId`, pull the matching policy, and render source URLs, timestamps, notes, and the clause matches derived from `lib/evidence.ts`.

- [ ] **Step 5: Re-run the tests, build, and commit**

Run:
```bash
npx vitest run tests/lib/evidence.test.ts
npm run build
```
Expected: evidence tests pass and the app still builds.

Commit:
```bash
git add components/evidence/evidence-workspace-screen.tsx components/evidence/comparison-panel.tsx components/evidence/policy-clause-list.tsx components/evidence/evidence-timeline.tsx lib/evidence.ts app/cases/[caseId]/evidence/page.tsx tests/lib/evidence.test.ts
git commit -m "feat: add evidence workspace"
```

---

## Phase 3: Trial system

### Task 7: Implement the trial engine and consensus logic

**Files:**
- Create: `lib/trial-engine.ts`
- Create: `lib/mock-trial-engine.ts`
- Create: `lib/verdict.ts`
- Create: `components/trial/trial-screen.tsx`
- Create: `components/trial/validator-card.tsx`
- Create: `components/trial/consensus-meter.tsx`
- Create: `app/cases/[caseId]/trial/page.tsx`
- Create: `tests/lib/trial-engine.test.ts`

- [ ] **Step 1: Write the failing trial-engine tests**

```ts
import { describe, expect, it } from "vitest";
import { runMockTrial } from "@/lib/mock-trial-engine";
import { restrictivePolicy, permissivePolicy, impersonationCase, attributionCase } from "@/lib/sample-data";

describe("runMockTrial", () => {
  it("returns Impersonation Risk when the policy blocks impersonation and the output imitates identity", async () => {
    const result = await runMockTrial({ case: impersonationCase, policy: restrictivePolicy });

    expect(result.receipt.finalVerdict).toBe("Impersonation Risk");
    expect(result.judgments).toHaveLength(3);
    expect(result.receipt.score).toBeGreaterThan(70);
  });

  it("downgrades to Needs Attribution when the only issue is missing credit", async () => {
    const result = await runMockTrial({ case: attributionCase, policy: permissivePolicy });

    expect(result.receipt.finalVerdict).toBe("Needs Attribution");
  });
});
```

- [ ] **Step 2: Run the trial tests and confirm they fail**

Run:
```bash
npx vitest run tests/lib/trial-engine.test.ts
```
Expected: helper-not-found failures until the engine and verdict helpers exist.

- [ ] **Step 3: Implement the trial contract and consensus rules**

Define the contract like this:

```ts
export interface TrialInput {
  case: ConsentCase;
  policy: ConsentPolicy;
}

export interface TrialResult {
  judgments: ValidatorJudgment[];
  receipt: VerdictReceipt;
}

export interface TrialEngine {
  runTrial(input: TrialInput): Promise<TrialResult>;
}
```

`runMockTrial` should generate three deterministic validator judgments, combine them through `aggregateVerdict`, and emit a receipt with score, summary, recommended action, and evidence references.

- [ ] **Step 4: Render the trial UI and expose the run action**

The trial screen should show each validator’s reasoning, confidence, cited evidence, and the consensus meter that moves as the receipt is generated.

- [ ] **Step 5: Re-run the tests, build, and commit**

Run:
```bash
npx vitest run tests/lib/trial-engine.test.ts
npm run build
```
Expected: trial engine tests pass and the app still builds.

Commit:
```bash
git add lib/trial-engine.ts lib/mock-trial-engine.ts lib/verdict.ts components/trial/trial-screen.tsx components/trial/validator-card.tsx components/trial/consensus-meter.tsx app/cases/[caseId]/trial/page.tsx tests/lib/trial-engine.test.ts
git commit -m "feat: add mock trial engine and consensus"
```

---

### Task 8: Build the verdict receipt and export/share actions

**Files:**
- Create: `components/receipt/receipt-screen.tsx`
- Create: `components/receipt/receipt-card.tsx`
- Create: `components/receipt/share-actions.tsx`
- Create: `lib/export.ts`
- Create: `app/cases/[caseId]/receipt/page.tsx`
- Create: `tests/lib/export.test.ts`

- [ ] **Step 1: Write the failing export helper tests**

```ts
import { describe, expect, it } from "vitest";
import { receiptToJson, receiptDownloadFilename } from "@/lib/export";
import { sampleReceipt } from "@/lib/sample-data";

describe("receiptToJson", () => {
  it("serializes a verdict receipt with stable indentation", () => {
    expect(receiptToJson(sampleReceipt)).toContain('"finalVerdict": "Violation"');
  });
});
```

- [ ] **Step 2: Run the export tests and confirm they fail**

Run:
```bash
npx vitest run tests/lib/export.test.ts
```
Expected: helper-not-found failures until the export module exists.

- [ ] **Step 3: Implement the receipt screen and export helpers**

The receipt should include the final verdict banner, confidence score, validator summary, cited evidence, and a recommended next action. Add a JSON download button, a clipboard share action, and a human-readable filename that includes the case id and verdict.

- [ ] **Step 4: Re-run the tests, build, and commit**

Run:
```bash
npx vitest run tests/lib/export.test.ts
npm run build
```
Expected: export tests pass and the app still builds.

Commit:
```bash
git add components/receipt/receipt-screen.tsx components/receipt/receipt-card.tsx components/receipt/share-actions.tsx lib/export.ts app/cases/[caseId]/receipt/page.tsx tests/lib/export.test.ts
git commit -m "feat: add verdict receipt and export actions"
```

---

## Phase 4: Polish and verification

### Task 9: Polish responsiveness, empty states, loading states, and accessibility

**Files:**
- Modify: `app/globals.css`
- Modify: `components/site-shell.tsx`
- Modify: all screen components as needed for mobile layout and focus order
- Create: `app/not-found.tsx`
- Create: `app/loading.tsx`
- Create: `app/policy/loading.tsx`
- Create: `app/cases/new/loading.tsx`
- Create: `app/cases/[caseId]/loading.tsx`
- Test: `tests/e2e/keyboard.spec.ts`

- [ ] **Step 1: Add the final visual pass**

Lock in the forensic-document aesthetic: parchment background, grain overlay, scarlet verdict ribbon, mono metadata pills, and a readable mobile stack that preserves the same tone instead of falling back to generic cards.

- [ ] **Step 2: Add empty states and loading skeletons**

Each route should handle missing cases and policies cleanly, and each route segment should have a lightweight loading state that feels intentional.

- [ ] **Step 3: Add accessibility and keyboard coverage**

Use explicit `aria-label`s for compare panes, make verdict updates screen-reader friendly, and ensure the tab order still matches the intended workflow on the policy, intake, evidence, trial, and receipt pages.

- [ ] **Step 4: Re-run build and keyboard coverage**

Run:
```bash
npm run build
npx playwright test tests/e2e/keyboard.spec.ts
```
Expected: the app builds cleanly and keyboard navigation still works.

- [ ] **Step 5: Commit the polish pass**

Commit:
```bash
git add app/globals.css components/site-shell.tsx app/not-found.tsx app/loading.tsx app/policy/loading.tsx app/cases/new/loading.tsx app/cases/[caseId]/loading.tsx tests/e2e/keyboard.spec.ts

git commit -m "feat: polish ConsentVault UI and states"
```

---

### Task 10: Run end-to-end verification and capture demo artifacts

**Files:**
- Create: `tests/e2e/consentvault-flow.spec.ts`
- Create: `tests/e2e/a11y.spec.ts`
- Modify: `playwright.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Run the app locally and walk the full demo path in the browser**

Run:
```bash
npm run dev
```
Then verify the exact flow manually: dashboard -> policy -> intake -> evidence -> trial -> receipt.

- [ ] **Step 2: Write the full flow Playwright test**

The test should click through the same path, run the mock trial, and confirm the final receipt shows the expected verdict and confidence.

- [ ] **Step 3: Add a lightweight accessibility check**

Assert that the main pages have a single top-level heading, clear link names, and visible focus states on the workflow controls.

- [ ] **Step 4: Re-run the full verification suite**

Run:
```bash
npm run test
npm run test:e2e
npm run build
```
Expected: all three pass before anything is considered done.

- [ ] **Step 5: Capture screenshots and commit the final verification pass**

Capture screenshots for the dashboard, evidence workspace, trial screen, and receipt screen, then commit the finished state.

Commit:
```bash
git add tests/e2e/consentvault-flow.spec.ts tests/e2e/a11y.spec.ts playwright.config.ts package.json
git commit -m "docs: record final ConsentVault verification"
```

---

## Spec Coverage Map

- **Dashboard** -> Task 3
- **Consent Policy Builder** -> Task 4
- **Dispute Intake** -> Task 5
- **Evidence Workspace** -> Task 6
- **GenLayer Consent Trial** -> Task 7
- **Consent Verdict Receipt** -> Task 8
- **Responsive polish and accessibility** -> Task 9
- **Browser verification and demo capture** -> Task 10
- **Shared data model / sample data / persistence** -> Task 2
- **Project scaffold and visual system** -> Task 1

---

## Self-Review

- [x] No placeholders like TBD, TODO, or "implement later".
- [x] Every route in the source spec maps to one or more tasks.
- [x] Core helper names stay consistent across tasks (`ConsentVaultState`, `TrialEngine`, `VerdictReceipt`, `ConsentPolicy`).
- [x] The plan stays focused on one integrated MVP instead of splitting into unrelated sub-projects.
- [x] The implementation strategy is test-first for pure logic and browser-verified for the UI.
