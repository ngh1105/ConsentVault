# ConsentVault UI Redesign — Modern SaaS (Linear/Vercel) — Design Spec

**Date:** 2026-05-18
**Audience:** demo + pitch (judges, GenLayer team) AND end-user creators

## Goal

Replace the current "dossier / parchment / serif" visual identity with a modern SaaS aesthetic in the Linear / Vercel / Arc family while keeping the ConsentVault crimson accent as a thread of continuity. Cover all 7 routes (`/`, `/policy`, `/cases/new`, `/cases/[id]`, `/cases/[id]/evidence`, `/cases/[id]/trial`, `/cases/[id]/receipt`) plus the global app shell.

Hand-off mode: hybrid with OpenDesign — Claude writes the design prompt and the design tokens, the user pastes the prompt into the OpenDesign app and generates artifacts, Claude then reconnects the `open-design` MCP server (read-only) to pull artifacts and ports them into the Next.js codebase.

Out of scope: information-architecture rework (routing stays the same), backend/contract changes, copywriting overhaul (UI text remains intact unless a component is being replaced), animations beyond hover/enter transitions.

---

## 1. Brand direction & design tokens

### Palette (HSL CSS vars)

**Dark mode (default):**

| Token | HSL | Use |
|---|---|---|
| `--background` | `240 6% 6%` | App background (zinc-950) |
| `--card` | `240 5% 10%` | Card surface |
| `--card-elevated` | `240 5% 13%` | Hover / popover |
| `--border` | `240 4% 16%` | Subtle dividers |
| `--border-strong` | `240 4% 24%` | Inputs, focus |
| `--foreground` | `0 0% 98%` | Primary text |
| `--muted-foreground` | `240 5% 65%` | Secondary text |
| `--accent` | `350 80% 55%` | Brand crimson — buttons, focus, links |
| `--accent-foreground` | `0 0% 100%` | Text on accent |
| `--success` | `142 70% 45%` | Allowed verdicts |
| `--warning` | `38 92% 50%` | Needs Attribution / License |
| `--danger` | `0 84% 60%` | Violation / Impersonation Risk |

**Light mode:**

| Token | HSL |
|---|---|
| `--background` | `0 0% 100%` |
| `--card` | `240 5% 98%` |
| `--card-elevated` | `0 0% 100%` |
| `--border` | `240 6% 90%` |
| `--border-strong` | `240 5% 80%` |
| `--foreground` | `240 10% 4%` |
| `--muted-foreground` | `240 4% 46%` |
| `--accent` | `350 80% 50%` |
| Semantic status colors | identical HSL values to dark mode; verified at 4.5:1+ contrast against `--background` for body text and 3:1+ for large text via `tests/e2e/axe.spec.ts` (0 violations on light theme) |

Light mode semantic colors verified at 4.5:1+ for body text by axe e2e (`tests/e2e/axe.spec.ts`, 0 violations).

The ConsentVault crimson stays as the single accent. No secondary brand color. Status colors (success/warning/danger) are reserved for verdict semantics, never for chrome.

### Typography

- **Sans (display + body):** Inter, loaded via `next/font/google` as a variable font, fallback `ui-sans-serif, system-ui, sans-serif`.
- **Mono:** JetBrains Mono variable, used for: addresses, IDs, eyebrows / kicker labels, JSON previews, numerical metadata.
- Drop the existing `var(--font-display) Georgia serif` stack entirely.

**Type scale (Tailwind):** xs / sm / base / lg / xl / 2xl / 4xl / 6xl. The 7xl size is reserved for the receipt score number; no display copy uses it.

**Tracking:** body `tracking-normal`, mono labels `tracking-[0.18em]`, headings `tracking-tight`.

### Motion

- Hover: `transition-colors duration-150 ease-out`.
- Card / surface enter: `transition-all duration-200 ease-out` on opacity + translate-y-1.
- Page enter: 350ms fade + 8px translate via Tailwind `animate-in fade-in slide-in-from-bottom-2`.
- No bouncy / spring easing. No layout-shift animations.
- Respect `prefers-reduced-motion`: gate every transition behind `motion-safe:` modifier.

### Effects

- Mesh gradient hero background: SVG component using radial gradients at 30% top, accent / muted blend, used only on dashboard hero and receipt verdict banner. Never as page background.
- Glass surfaces (`backdrop-blur-xl bg-[var(--card)]/80`): only on overlays, popovers, and the Cmd+K command palette. Never on cards or full sections.
- Drop `grain-overlay`, `ledger-divider`, `shadow-dossier`, `evidence-card` background-image stacks, parchment radial gradients on `body`.

### Accessibility

- All text/background pairs must meet WCAG AA (4.5:1 normal, 3:1 large) in both modes — verify with axe via `tests/e2e/axe.spec.ts` after the redesign.
- Focus ring: `outline 2px solid hsl(var(--accent)) outline-offset 3px` plus `ring-4 ring-accent/16`. Never remove focus styles.
- Mono labels never below 12px.

---

## 2. Layout system

### Top bar (`AppTopBar`)

Sticky `top-0`, `h-14`, `border-b`, `bg-background/80 backdrop-blur-md`.

- **Left:** ConsentVault logo + wordmark (mono, uppercase, tracking-wider, text-sm).
- **Center:** nav links — Dashboard / Cases / Policy. Active link = foreground color + 2px crimson underline. Inactive = muted-foreground, hover = foreground.
- **Right:** ThemeToggle (sun / moon / system, popover), then WalletConnectButton (re-skinned, see §4).

Mobile (`< md`): center nav collapses into a hamburger sheet; logo + wallet stay in the bar.

### Progress rail (`CaseProgressRail`)

Sticky `top-14`, `h-12`, `border-b`, only rendered when route matches `/cases/[id]/*`.

- 4 steps: **Setup → Evidence → Trial → Receipt**, mapped to `/cases/[id]`, `/cases/[id]/evidence`, `/cases/[id]/trial`, `/cases/[id]/receipt`.
- Step states:
  - `done`: 8px accent dot + check icon, label muted-foreground.
  - `current`: 8px accent dot with `ring-4 ring-accent/16`, label foreground + accent underline.
  - `locked`: 8px zinc-600 dot, label muted-foreground, `aria-disabled` and not a link.
- Locked logic: cannot reach Trial without evidence saved; cannot reach Receipt without a finalized trial. Existing route guards already enforce this server-side; the rail mirrors that state.
- Mobile: horizontal scroll, current step centered programmatically with `scrollIntoView({ inline: "center" })`.

### Page container

Single max-width: 1280px, horizontal padding `px-6 md:px-10`. Vertical rhythm `py-12 md:py-16`. No more `max-w-dossier 88rem`. Hero sections may break out to full-bleed when explicitly designed (dashboard, receipt).

---

## 3. Screen treatments

| Route | Hero | Body |
|---|---|---|
| `/` (dashboard) | Mesh-gradient hero block. H1 "Protect what you create" (text-6xl, tracking-tight, text-balance). Subhead 1 line. Primary CTA "Open new case" + secondary "Read the policy". | StatCard row × 3: active cases / receipts issued / validators online. DataTable of recent cases (Title, Verdict pill, Score, Date, →). 3-card "How it works" section below. EmptyState when no cases. |
| `/policy` | Inline H1 "Creator policy" + "Active" pill. | Two-column split: left = form fields (creator name, allowed uses, blocked uses, attribution rules, license rules, jurisdiction). Right = sticky live JSON preview (mono, syntax-highlighted via simple span coloring — no external dep). Save CTA in form footer. |
| `/cases/new` | H1 "New case" + step indicator (1/1, single page wizard for now). | Stacked sections with section dividers: Case info → Original content → AI output → Source links → Notes. Sticky bottom action bar (border-t, bg-background) with "Save draft" + "Continue to evidence". |
| `/cases/[id]` | Status pill (Draft / In trial / Resolved) + H1 case title + timestamp meta. | Vertical timeline component: created → evidence added → trial run → receipt issued, each with timestamp + secondary action ("View evidence" etc.). |
| `/cases/[id]/evidence` | Section title "Evidence" + count badge. | Drag-drop zone full-width (border-dashed, hover-fill). Below: 3-column grid of EvidenceCards (id mono, type pill, title, description, remove). Empty state when none. |
| `/cases/[id]/trial` | "Trial in progress" eyebrow + H1 case title + ConsensusMeter (segmented bar, 3 colors, animates as judgments arrive). | Row of 3 ValidatorCards (Signal House / Rights Ledger / Public Interest Lab): name, lens, verdict pill, confidence ring (radial 0-100%), reasoning text, cited evidence chips. Skeleton state on load, fade-in as each judgment streams. "Re-run trial" + "View receipt" CTAs at bottom. |
| `/cases/[id]/receipt` | Full-bleed VerdictBanner with mesh gradient colored by verdict (green / amber / red). H1 verdict name (text-5xl), Score number (text-7xl mono). | Metadata grid 2×N: case ID, contract address, transaction hash, validator count, evidence count, timestamp. Share button (copy link). JSON export accordion at bottom. |

Existing tests (`tests/e2e/consentvault-flow.spec.ts`, `dashboard.spec.ts`) must pass after the redesign. The trial-h1 failure currently in the e2e suite is out of scope for this spec — it has its own follow-up spec from 2026-05-18.

---

## 4. Component inventory

**Re-skin (keep API, replace internals):**
- `WalletConnectButton` — same status / address / connect API, new dark-friendly chrome, mono label.
- `TrialGuard` — paywall pattern with new EmptyState illustration.
- `SiteShell` → rename `AppShell`, embeds `AppTopBar` and conditionally `CaseProgressRail` based on route.

**New components (under `components/ui/` for primitives, `components/<area>/` for composed):**
- `ProgressRail` — props: `caseId`, `currentStep`, `steps[]` (id, label, href, state).
- `CommandPalette` — Cmd+K / Ctrl+K opens overlay; quick-nav cases by id, jump to policy, toggle theme. Built on top of native `<dialog>` with backdrop-blur surface.
- `ThemeToggle` — three-state (system / dark / light), persisted in `localStorage` under `consentvault:theme`, syncs `<html>` class on mount.
- `ValidatorCard` — replaces dossier-style judgment block. Props: validator (id, name, lens), judgment (verdict, confidence, reasoning, evidence ids), state (`loading` | `ready`).
- `VerdictBanner` — full-bleed hero for receipt page, gradient driven by verdict semantic color.
- `StatCard` — dashboard metric card, props: label, value, delta (optional).
- `DataTable` — minimal table with sticky header, hover row, mono numeric columns.
- `EmptyState` — illustration slot + headline + description + primary CTA.
- `Skeleton` — for trial streaming and page load fallbacks.
- `MeshGradient` — pure SVG component, prop `tone: "neutral" | "allowed" | "warning" | "danger"`.
- `Badge` / `Pill` — variants: `neutral` | `accent` | `success` | `warning` | `danger`.
- `Tabs`, `Tooltip`, `Dialog` — primitives via headless approach (no new dep; build on `<details>` / `<dialog>` / radix-style hooks if a small dep is needed, decision deferred to plan).

**Drop:** `evidence-card` class, `verdict-banner` class (parchment version), `grain-overlay`, `ledger-divider`, `metadata-label` (replaced by `Badge`), `archive-grid`, `archive-overflow-wrap`, `bg-accent/6`, `bg-accent/8` arbitrary utilities, the body `background-image` parchment stack, `shadow-dossier`.

**Tailwind config changes:** drop `dossier` shadow, drop `display`/`mono` font fallbacks (now driven by Inter / JetBrains Mono via `next/font`), drop `maxWidth.dossier`, drop `backgroundImage.grain`. Keep `spacing.18` if still referenced.

---

## 5. OpenDesign prompt + MCP integration flow

### The prompt to paste into OpenDesign

The implementation plan generates this prompt as `docs/superpowers/prompts/2026-05-18-ui-redesign-opendesign.md` and the user pastes it into a new OpenDesign project. The prompt includes:

1. **Project context** (1 paragraph): ConsentVault is a Next.js 15 app for AI-content consent verdicts on the GenLayer chain, current stack uses Tailwind 3.4 + React 19 + Inter / JetBrains Mono.
2. **Brand direction** (verbatim from §1 of this spec).
3. **Layout system** (verbatim from §2).
4. **Screen-by-screen brief** (verbatim from §3 table, expanded into per-screen sections each ending with "deliverable: dark + light variant React + Tailwind").
5. **Component inventory** (verbatim from §4 with explicit prop / state lists).
6. **Reference moodboard:** Linear (sidebar density, motion), Vercel (hero gradient, type ramp), Arc (color discipline, glass overlays).
7. **Output instruction:** "Generate React components and a tokens.css file. Use Tailwind class names; do not invent new utilities. Provide one entry HTML page per screen that imports the components. Include both dark and light variants. Do not use Georgia serif, parchment textures, or grain overlays."

### MCP flow (read-only, after user generates in OD)

The implementation plan will sequence:

1. User opens OpenDesign, creates a new project named `consentvault-redesign`, pastes the prompt, generates artifacts.
2. User confirms with Claude when generation is done.
3. Claude reconnects the `open-design` MCP server (currently disconnected per the session reminder).
4. Claude calls `get_active_context` to pin the project ID, then `list_files` to enumerate generated artifacts.
5. Claude calls `get_artifact` to pull the entry HTML + every referenced sibling (tokens.css, JSX modules) in one go per screen.
6. Claude ports artifacts into the codebase:
   - tokens.css → merge into `app/globals.css` (replacing the existing `:root` block, adding `[data-theme="light"]` overrides).
   - tailwind.config.ts → update extended theme to match.
   - Component JSX → `components/ui/*` (primitives) and `components/<area>/*` (composed).
   - Screen layouts → adapt the route files (`app/page.tsx`, `app/policy/page.tsx`, etc.) keeping data-fetching and routing untouched.
7. Claude runs `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e -- --grep dashboard` after each major chunk (one commit per route is the target rhythm).

### Scope of the MCP read calls

The OD MCP server is read-only by design (per its instruction block: `get_artifact`, `get_file`, `search_files`, `list_files`, `list_projects`, `get_active_context`). All generation happens in the OpenDesign app via user action; Claude only reads artifacts and ports them. There is no MCP write API.

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| OD generates artifacts that diverge from the prompt (wrong tokens, missing screens) | Plan includes a verification step per screen: tokens diff vs. spec, lint, axe accessibility, visual diff against Linear / Vercel reference shots. If divergence is large, regenerate the offending screen with a tightened prompt segment. |
| Theme toggle introduces FOUC | Use the standard `next-themes` pattern (or a 12-line in-house equivalent) that sets `<html>` class from a synchronous script in `<head>` before hydration. Decision in the plan. |
| Existing tests break (selectors, copy, ARIA roles) | Each commit re-runs vitest + dashboard e2e + axe. `consentvault-flow.spec.ts` is allowed to remain failing only because of the pre-existing trial-h1 issue tracked separately. |
| `bg-accent/8` arbitrary utilities removed but referenced in existing components | The plan grep-checks for every dropped class before removing it from `globals.css` and replaces usages. |
| Build size regression (Inter + JetBrains Mono variable fonts add weight) | Use `next/font` subsets (latin only). Audit bundle after first commit; revert to single weight if regression is significant. |

---

## Acceptance criteria

A. All 7 routes render with the new visual system in both dark and light mode.
B. `AppTopBar` and `CaseProgressRail` work across all routes; theme toggle persists; Cmd+K opens command palette.
C. `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e -- --grep dashboard`, axe accessibility e2e all green.
D. No reference to `dossier` / `parchment` / `grain` / `Georgia` / `serif` remains in `app/`, `components/`, `lib/`, `tailwind.config.ts`, `app/globals.css`.
E. WCAG AA contrast verified by axe in both modes for all 7 routes.
F. The OpenDesign prompt file exists at `docs/superpowers/prompts/2026-05-18-ui-redesign-opendesign.md` and matches §5 of this spec verbatim.

---

## Open questions deferred to plan

- Headless primitive library (radix vs. in-house vs. react-aria) — decided in plan based on bundle / a11y trade-off.
- Whether to add `next-themes` or write a 12-line theme sync — decided in plan.
- Whether dashboard StatCard values come from real data (count cases / receipts) or are illustrative — decided in plan based on data availability.
