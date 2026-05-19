# Tailwind `destructive` Color Token Undefined

**Date:** 2026-05-18
**Branch (origin):** `codex/genlayer-wallet-v1`
**Source:** Surfaced during B1 (Tailwind opacity verification) of the GenLayer wallet v1 review-fix plan.

## Goal

Define the `destructive` color in the Tailwind theme so every existing
`text-destructive`, `bg-destructive/N`, and `border-destructive/N` utility
emits the intended red surface instead of compiling to no-op CSS.

## Problem

`tailwind.config.ts` extends only `primary`, `accent`, `muted`, etc. —
`destructive` is never declared, so Tailwind drops every utility that
references it. The error boundary, trial screen error banner, and
trial-guard misconfiguration banner all render with default browser
foreground/background.

Affected files (call sites):

- `app/error.tsx:27` — header pill
- `app/error.tsx:42` — error detail block (also uses `/8` opacity)
- `components/trial/trial-screen.tsx:169` — trial run failure banner
- `components/trial/trial-guard.tsx:93` — contract address misconfig label

The B1 task confirmed Tailwind 3.4 supports the `/8` opacity step, so the
remaining dead pixels are entirely caused by the missing token.

## Non-goals

- Replacing the destructive utilities with one-off hex strings inline. The
  utility names already convey intent; the fix is to register the token.
- Theming `destructive` differently per route. One token, one shade.
- Adding `destructive-foreground` / `destructive-muted` variants. YAGNI
  until a designer asks for layered destructive surfaces.

## Approach

Define `destructive` as a CSS custom property in `app/globals.css`
(matching the existing token pattern with `--color-*` vars), then reference
it from `tailwind.config.ts` under `theme.extend.colors`.

Suggested shade: `oklch(0.61 0.21 25)` (a saturated red close to the
shadcn default), with `--color-destructive-foreground: oklch(0.985 0 0)`
reserved for future use but not wired yet.

The Tailwind config exposes the token as
`destructive: "oklch(var(--color-destructive) / <alpha-value>)"` so the
existing `/N` opacity utilities work without touching call sites.

## Verification

1. `npm run build` succeeds.
2. Inspect generated CSS for `.text-destructive`, `.bg-destructive\/10`,
   and `.bg-destructive\/8` rules — each should resolve to the new token.
3. Trigger the error boundary at `/throw-error` (dev-only debug route) or
   force a contract misconfig in `trial-guard` and confirm the banner
   renders red.
4. Playwright sanity: dashboard + meta specs unchanged.

## Risks

1. **Color clash with brand palette.** If the chosen oklch lands too close
   to the existing accent red, designers may want a swap. Mitigation: keep
   the value in the CSS custom property so a one-line change re-themes
   every banner.
2. **Hidden cascade.** Some legacy CSS may already cover the destructive
   call sites with `text-red-500` overrides. Audit only the four files
   above; no global hunt required.

## Out of scope

- Replacing the destructive token with a `--color-error` rename. Token
  ergonomics is a separate refactor.
- Adding hover/focus variants. The current call sites are static blocks.
