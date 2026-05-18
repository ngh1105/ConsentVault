# E2E Trial-Page H1 Lookup Failure

**Date:** 2026-05-18
**Branch (origin):** `codex/genlayer-wallet-v1`
**Source:** `tests/e2e/consentvault-flow.spec.ts` failing on the H1 query
during the GenLayer wallet v1 verification pass.

## Goal

Restore green `npm run test:e2e -- --grep consentvault-flow` by reconciling
the spec's expected H1 text with whatever the trial route actually
renders today.

## Problem

The flow spec navigates to `/cases/case-voice-clone/trial` and expects a
specific H1 string. Recent UI churn (trial-guard rework, trial-screen
helper unification, OG metadata refactor) plausibly shifted the H1 to a
different node or different text. The failure predates this branch
according to git blame, so the regression originated upstream.

## Non-goals

- Replacing Playwright with another runner.
- Refactoring the trial layout to host an H1 in a different location.
- Hardening every E2E selector across the suite. Scope is just this one
  flow.

## Approach

Two-step diagnosis before code changes:

1. **Run the spec against the dev server** and capture the actual DOM
   under the trial route. Compare to the spec's `getByRole("heading",
   {level: 1})` (or whichever locator is in use).
2. **Identify which side is wrong:**
   - If the page genuinely lost its H1, restore the H1 in the trial
     screen.
   - If the page has an H1 but the text changed, update the spec to use
     a stable accessible name.

Bias toward the accessibility fix (restore an H1) over loosening the
selector. The trial route is a primary navigation target; it should have
a deterministic H1 for screen readers regardless of test concerns.

## Verification

1. `npm run test:e2e -- --grep consentvault-flow` passes locally.
2. Manual axe scan in the browser confirms exactly one H1 on the trial
   route.
3. Other Playwright specs (`dashboard.spec.ts`, `meta.spec.ts`)
   unchanged.

## Risks

1. **Cascading selector updates.** Other specs may rely on the same H1
   text. Search the test directory for the literal before changing it.
2. **SSR vs client mismatch.** If the H1 is rendered client-side after
   trial state initializes, the spec needs an explicit wait for the
   readiness signal rather than racing first paint.

## Out of scope

- Adding visual-regression snapshots for the trial route.
- Migrating the spec to component-level testing.
- Stabilising the wallet-connect overlay in E2E. That is its own ticket.
