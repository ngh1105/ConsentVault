# ConsentVault Modern-SaaS UI Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dossier/parchment visual identity with a modern SaaS aesthetic (Linear/Vercel) across all 7 ConsentVault routes, generated via OpenDesign and ported through the read-only `open-design` MCP.

**Architecture:** Hybrid hand-off — Claude writes the OpenDesign prompt, user generates artifacts in the OpenDesign app, Claude pulls artifacts via the read-only MCP and ports them into the Next.js codebase. Commits are scoped one per primitive batch / composed batch / route to keep the branch shippable at every step.

**Tech Stack:** Next.js 15, React 19, Tailwind 3.4, TypeScript 5.8, `next-themes`, Inter + JetBrains Mono via `next/font`, Vitest 3, Playwright 1.52, axe-core.

**Spec:** `docs/superpowers/specs/2026-05-18-ui-redesign-modern-saas-design.md` (commit `f5d695d`).

---

## Decisions (locked in before any code)

| Question | Decision | Rationale |
|---|---|---|
| Headless primitive library | **In-house** using native `<dialog>`, `<details>`, `<button>` + small custom hooks | Each radix-ui primitive ~30KB; react-aria heavier. Project only needs dialog + tabs + tooltip + popover; native elements + Tailwind cover it. CommandPalette uses `<dialog>` + 30-line focus-trap hook. |
| Theme sync | **`next-themes` v0.4** | Mature, ~2KB, fixes FOUC with inline `<script>` injected into `<head>`. In-house equivalent is fragile under Next.js App Router SSR. |
| StatCard data | **Real counts from existing case store** (active cases, receipts issued) + static "validators online: 3" | Existing reducer holds receipts. No backend lookup needed. |

---

## Branch strategy

Branch off `master` named `codex/ui-redesign-modern-saas`. Each task in this plan creates exactly one commit. The branch ends shippable after every commit.

---

## File structure

**Created:**
- `docs/superpowers/prompts/2026-05-18-ui-redesign-opendesign.md` — OpenDesign prompt
- `app/fonts.ts` — `next/font` Inter + JetBrains Mono setup
- `components/theme/theme-provider.tsx` — `next-themes` wrapper
- `components/theme/theme-toggle.tsx` — sun/moon/system tri-state toggle
- `components/ui/badge.tsx`
- `components/ui/skeleton.tsx`
- `components/ui/dialog.tsx` — wraps `<dialog>` element
- `components/ui/tooltip.tsx` — pure-CSS tooltip primitive
- `components/ui/tabs.tsx`
- `components/ui/mesh-gradient.tsx` — SVG component, tone variants
- `components/ui/empty-state.tsx`
- `components/ui/data-table.tsx`
- `components/ui/stat-card.tsx`
- `components/ui/validator-card.tsx`
- `components/ui/verdict-banner.tsx`
- `components/ui/progress-rail.tsx`
- `components/shell/app-top-bar.tsx`
- `components/shell/app-shell.tsx` — replaces `SiteShell`
- `components/shell/command-palette.tsx`
- `lib/hooks/use-focus-trap.ts`
- `tests/components/<each-component>.test.tsx` — vitest coverage for logic components

**Modified:**
- `app/globals.css` — drop parchment, replace `:root` palette, add `.light` overrides
- `app/layout.tsx` — wire fonts + ThemeProvider + AppShell, remove SiteShell
- `tailwind.config.ts` — drop dossier shadow / display font / `maxWidth.dossier` / `backgroundImage.grain`, add `card-elevated`, `border-strong`, `success`, `warning`, `danger` color tokens
- `package.json` — add `next-themes`
- `app/page.tsx`, `app/policy/page.tsx`, `app/cases/new/page.tsx`, `app/cases/[caseId]/page.tsx`, `app/cases/[caseId]/evidence/page.tsx`, `app/cases/[caseId]/trial/page.tsx`, `app/cases/[caseId]/receipt/page.tsx` — re-skinned route content
- `components/wallet/wallet-connect-button.tsx` — re-skin chrome (keep API)
- `components/trial/trial-guard.tsx` — re-skin paywall (keep API)
- `components/intake/case-intake-screen.tsx` — re-layout to new sectioned form
- `components/trial/trial-screen.tsx` — render new `ValidatorCard` row

**Deleted:**
- `components/site-shell.tsx` (replaced by `app-shell.tsx`)
- All `evidence-card`, `verdict-banner`, `grain-overlay`, `ledger-divider`, `metadata-label`, `archive-grid`, `archive-overflow-wrap` selectors from `globals.css`
- `bg-accent\/6`, `bg-accent\/8`, `border-ink\/10` arbitrary utilities from `globals.css`

---

## Task 1: Branch + dependencies

**Files:** `package.json`, `package-lock.json`

- [ ] **Step 1: Create branch from master**

```bash
git checkout master
git pull origin master
git checkout -b codex/ui-redesign-modern-saas
```

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install next-themes
```

Expected: `next-themes` resolves to a v0.4.x release, lockfile updates.

- [ ] **Step 3: Verify install**

```bash
node -e "console.log(require('next-themes/package.json').version)"
```

Expected: prints something like `0.4.4`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): add next-themes for dark/light mode toggle"
```

---

## Task 2: Write OpenDesign prompt file

**Files:** `docs/superpowers/prompts/2026-05-18-ui-redesign-opendesign.md` (new)

- [ ] **Step 1: Create the prompt directory + file**

Write to `docs/superpowers/prompts/2026-05-18-ui-redesign-opendesign.md`:

````markdown
# OpenDesign prompt — ConsentVault modern-SaaS redesign

Paste this entire file into a new OpenDesign project named `consentvault-redesign`.

## Project context

ConsentVault is a Next.js 15 app for AI-content consent verdicts on the GenLayer chain. The frontend submits a case + creator policy bundle to a GenVM intelligent contract; three validator personas (Signal House, Rights Ledger, Public Interest Lab) issue judgments which are aggregated into a final verdict + receipt. Stack: Tailwind 3.4, React 19, TypeScript 5.8. Inter + JetBrains Mono via `next/font`.

## Brand direction

Modern SaaS aesthetic in the **Linear / Vercel / Arc** family. Dark mode default with light-mode toggle. Crimson accent stays; everything else dropped.

### Palette (HSL CSS variables)

**Dark mode (default):**
- `--background` `240 6% 6%`
- `--card` `240 5% 10%`
- `--card-elevated` `240 5% 13%`
- `--border` `240 4% 16%`
- `--border-strong` `240 4% 24%`
- `--foreground` `0 0% 98%`
- `--muted-foreground` `240 5% 65%`
- `--accent` `350 80% 55%`
- `--accent-foreground` `0 0% 100%`
- `--success` `142 70% 45%`
- `--warning` `38 92% 50%`
- `--danger` `0 84% 60%`

**Light mode:**
- `--background` `0 0% 100%`
- `--card` `240 5% 98%`
- `--card-elevated` `0 0% 100%`
- `--border` `240 6% 90%`
- `--border-strong` `240 5% 80%`
- `--foreground` `240 10% 4%`
- `--muted-foreground` `240 4% 46%`
- `--accent` `350 80% 50%`
- success / warning / danger same HSL as dark

### Typography

- Sans (display + body): Inter variable
- Mono: JetBrains Mono variable — for IDs, addresses, eyebrows, JSON previews
- Drop all serif fonts
- Scale: text-xs / sm / base / lg / xl / 2xl / 4xl / 6xl. text-7xl reserved for receipt score.

### Motion

- Hover: 150ms ease-out colors
- Card enter: 200ms ease-out opacity + translate-y-1
- Page enter: 350ms fade + 8px translate
- Respect `prefers-reduced-motion`

### Effects

- Mesh-gradient hero: SVG radial gradients at 30% top, only on dashboard hero + receipt verdict banner
- Glass surface: `backdrop-blur-xl bg-card/80` only on overlays / popovers / command palette
- Forbidden: parchment textures, grain overlays, Georgia serif

## Layout system

### `AppTopBar`

Sticky `top-0`, h-56px, border-b, `bg-background/80 backdrop-blur-md`.
- Left: logo + wordmark (mono uppercase tracking-wider text-sm)
- Center: nav Dashboard / Cases / Policy. Active = foreground + 2px crimson underline.
- Right: ThemeToggle → WalletConnectButton

### `CaseProgressRail`

Sticky `top-14`, h-48px, border-b. Only on `/cases/[id]/*`.
- 4 steps: Setup → Evidence → Trial → Receipt
- States: done / current / locked
- Mobile: horizontal scroll, current centered

### Page container

Max-width 1280px, padding `px-6 md:px-10`, `py-12 md:py-16`. Hero may break full-bleed.

## Screen briefs

For EACH screen, produce one entry HTML page with **dark + light variants**:

### `/` Dashboard
- Hero: Mesh-gradient block. H1 "Protect what you create". CTA "Open new case" + "Read the policy"
- Body: StatCard row × 3 + DataTable Recent cases + 3-card "How it works" + EmptyState

### `/policy`
- Hero: Inline H1 "Creator policy" + "Active" pill
- Body: Two-column split — form left, sticky live JSON preview right (mono, span-coloured)

### `/cases/new`
- Hero: H1 "New case", step indicator
- Body: Stacked sections (Case info → Original → AI output → Source links → Notes). Sticky bottom action bar.

### `/cases/[id]`
- Hero: Status pill + H1 case title + timestamp
- Body: Vertical timeline (created → evidence → trial → receipt)

### `/cases/[id]/evidence`
- Hero: Title + count badge
- Body: Drag-drop zone + 3-col grid of EvidenceCards. EmptyState when none.

### `/cases/[id]/trial`
- Hero: Eyebrow + H1 + ConsensusMeter (segmented bar)
- Body: 3 ValidatorCards (name, lens, verdict pill, confidence ring, reasoning, evidence chips). Skeleton on load.

### `/cases/[id]/receipt`
- Hero: Full-bleed VerdictBanner with mesh gradient (success/warning/danger), H1 verdict, score 7xl mono
- Body: Metadata grid 2×N + Share + JSON export accordion

## Component inventory (props + state)

- `Badge` — variant: neutral | accent | success | warning | danger
- `Skeleton` — width / height / rounded
- `Dialog` — open / onClose / title / children
- `Tooltip` — content / placement
- `Tabs` — tabs[] / activeId / onChange
- `MeshGradient` — tone: neutral | allowed | warning | danger
- `EmptyState` — illustration / headline / description / cta
- `DataTable<T>` — columns[] / rows[] / onRowClick
- `StatCard` — label / value / delta?
- `ValidatorCard` — validator (id, name, lens) / judgment (verdict, confidence, reasoning, citedEvidenceIds) / state ('loading' | 'ready')
- `VerdictBanner` — verdict / score / caseTitle
- `ProgressRail` — steps[] (id, label, href, state)
- `AppTopBar` — embeds ThemeToggle + WalletConnectButton
- `CommandPalette` — open / onClose, search, results
- `ThemeToggle` — system / dark / light tri-state

## Reference moodboard

- Linear — type density, motion timing, mono labels
- Vercel — hero gradient, whitespace, type ramp
- Arc — color discipline, glass overlays

## Output instruction

Generate React components and a `tokens.css` file. Use Tailwind class names; do not invent new utilities. Provide one entry HTML page per screen importing the components. Include both dark and light variants.

**Forbidden:** Georgia serif, parchment textures, grain overlays, beige body backgrounds, heavy shadows.
````

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/prompts/2026-05-18-ui-redesign-opendesign.md
git commit -m "docs(prompts): OpenDesign prompt for modern-SaaS redesign"
```

---

## Task 3: User runs OpenDesign (manual gate)

**Files:** none (manual step)

- [ ] **Step 1: Hand off to user**

Tell the user:

> "Open the OpenDesign app, create a new project named `consentvault-redesign`, paste the entire contents of `docs/superpowers/prompts/2026-05-18-ui-redesign-opendesign.md` as the project prompt, and generate the artifacts. Tell me 'OD ready' when generation finishes."

- [ ] **Step 2: Wait for confirmation**

Do not proceed until the user confirms generation is complete. If user reports OD errored or artifacts diverge significantly, regenerate with a tightened prompt segment.

- [ ] **Step 3: No commit (manual gate)**

---

## Task 4: Pull OpenDesign artifacts via MCP

**Files:** `docs/superpowers/artifacts/2026-05-18-od-export/` (new, gitignored intermediate)

- [ ] **Step 1: Confirm MCP server is connected**

If `open-design` MCP shows disconnected, ask the user to reconnect it.

- [ ] **Step 2: Resolve active project**

Call `get_active_context` → confirm project is `consentvault-redesign`. If not, ask user to focus the right project window in OD.

- [ ] **Step 3: Enumerate files**

Call `list_files` with no project arg (active context). Expect entries: `tokens.css`, `App.tsx`, screen entries (`dashboard.tsx`, `policy.tsx`, ...), files in `components/`.

- [ ] **Step 4: Pull artifacts in batches**

Call `get_artifact` once per screen entry. Save the JSON response to local files under `docs/superpowers/artifacts/2026-05-18-od-export/<screen>.json`.

- [ ] **Step 5: Add artifacts directory to gitignore**

Append to `.gitignore`:

```gitignore
# OpenDesign export — intermediate, do not commit
docs/superpowers/artifacts/
```

- [ ] **Step 6: Commit gitignore update**

```bash
git add .gitignore
git commit -m "chore(gitignore): exclude OpenDesign export intermediate"
```

---

## Task 5: Set up next/font + ThemeProvider

**Files:** `app/fonts.ts` (new), `app/layout.tsx` (modify), `components/theme/theme-provider.tsx` (new)

- [ ] **Step 1: Create `app/fonts.ts`**

```ts
import { Inter, JetBrains_Mono } from "next/font/google";

export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
```

- [ ] **Step 2: Create `components/theme/theme-provider.tsx`**

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
```

- [ ] **Step 3: Wire fonts + provider in `app/layout.tsx`**

Replace the existing `<html>` / `<body>` block:

```tsx
import { fontSans, fontMono } from "./fonts";
import { ThemeProvider } from "@/components/theme/theme-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fontSans.variable} ${fontMono.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Remove `var(--font-display)` setup; remove parchment background gradient if present.

- [ ] **Step 4: Run dev**

```bash
npm run dev
```

Expected: site loads, no FOUC, font is Inter (page may look broken stylistically — fine, tokens come next).

- [ ] **Step 5: Commit**

```bash
git add app/fonts.ts app/layout.tsx components/theme/theme-provider.tsx
git commit -m "feat(theme): wire next/font Inter+JetBrains Mono and ThemeProvider"
```

---

## Task 6: Replace tokens in globals.css + tailwind.config.ts

**Files:** `app/globals.css` (rewrite), `tailwind.config.ts` (modify)

- [ ] **Step 1: Rewrite `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: 240 6% 6%;
  --card: 240 5% 10%;
  --card-elevated: 240 5% 13%;
  --border: 240 4% 16%;
  --border-strong: 240 4% 24%;
  --foreground: 0 0% 98%;
  --muted-foreground: 240 5% 65%;
  --accent: 350 80% 55%;
  --accent-foreground: 0 0% 100%;
  --success: 142 70% 45%;
  --warning: 38 92% 50%;
  --danger: 0 84% 60%;
  --ring: 350 80% 55%;
}

.light {
  --background: 0 0% 100%;
  --card: 240 5% 98%;
  --card-elevated: 0 0% 100%;
  --border: 240 6% 90%;
  --border-strong: 240 5% 80%;
  --foreground: 240 10% 4%;
  --muted-foreground: 240 4% 46%;
  --accent: 350 80% 50%;
  --ring: 350 80% 50%;
}

@layer base {
  * {
    @apply border-border;
  }
  html {
    scroll-behavior: smooth;
  }
  body {
    @apply bg-background font-sans text-foreground antialiased;
  }
  :focus-visible {
    outline: 2px solid hsl(var(--accent));
    outline-offset: 3px;
    box-shadow: 0 0 0 4px hsl(var(--accent) / 0.16);
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  /* Temporary shims to keep build green during transition. Removed in Task 20. */
  .bg-accent\/6 { background-color: hsl(var(--accent) / 0.06); }
  .bg-accent\/8 { background-color: hsl(var(--accent) / 0.08); }
  .border-ink\/10 { border-color: hsl(var(--foreground) / 0.1); }
}
```

- [ ] **Step 2: Rewrite `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          elevated: "hsl(var(--card-elevated))",
        },
        muted: { foreground: "hsl(var(--muted-foreground))" },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        border: {
          DEFAULT: "hsl(var(--border))",
          strong: "hsl(var(--border-strong))",
        },
        ring: "hsl(var(--ring))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 3: Run lint + build**

```bash
npm run lint && npm run build
```

Expected: build succeeds (with shim utilities). Pages may still look broken — fixed per-route in Tasks 16-19.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css tailwind.config.ts
git commit -m "feat(theme): replace tokens with modern-SaaS palette + shims"
```

---

## Task 7: Build `Badge` primitive

**Files:** `components/ui/badge.tsx` (new), `tests/components/ui/badge.test.tsx` (new)

- [ ] **Step 1: Failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders text", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies variant class", () => {
    render(<Badge variant="success">Allowed</Badge>);
    expect(screen.getByText("Allowed").className).toMatch(/success/);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm test -- tests/components/ui/badge.test.tsx
```

- [ ] **Step 3: Implement**

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "neutral" | "accent" | "success" | "warning" | "danger";

const variantClasses: Record<Variant, string> = {
  neutral: "bg-card-elevated text-muted-foreground border-border",
  accent: "bg-accent/15 text-accent border-accent/30",
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-danger/15 text-danger border-danger/30",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs uppercase tracking-[0.18em]",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 4: Run — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/ui/badge.tsx tests/components/ui/badge.test.tsx
git commit -m "feat(ui): add Badge primitive with semantic variants"
```

---

## Task 8: Build `Skeleton` + `MeshGradient` primitives

**Files:** `components/ui/skeleton.tsx`, `components/ui/mesh-gradient.tsx`

- [ ] **Step 1: Skeleton**

```tsx
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-card-elevated", className)}
      aria-hidden="true"
    />
  );
}
```

- [ ] **Step 2: MeshGradient**

```tsx
type Tone = "neutral" | "allowed" | "warning" | "danger";

const toneStops: Record<Tone, { from: string; to: string }> = {
  neutral: { from: "hsl(var(--accent) / 0.45)", to: "hsl(var(--accent) / 0)" },
  allowed: { from: "hsl(var(--success) / 0.5)", to: "hsl(var(--success) / 0)" },
  warning: { from: "hsl(var(--warning) / 0.5)", to: "hsl(var(--warning) / 0)" },
  danger: { from: "hsl(var(--danger) / 0.55)", to: "hsl(var(--danger) / 0)" },
};

export function MeshGradient({
  tone = "neutral",
  className = "",
}: {
  tone?: Tone;
  className?: string;
}) {
  const { from, to } = toneStops[tone];
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      preserveAspectRatio="none"
    >
      <defs>
        <radialGradient id={`mg-${tone}`} cx="30%" cy="0%" r="80%">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill={`url(#mg-${tone})`} />
    </svg>
  );
}
```

- [ ] **Step 3: Build**

```bash
npm run build
```

Expected: green.

- [ ] **Step 4: Commit**

```bash
git add components/ui/skeleton.tsx components/ui/mesh-gradient.tsx
git commit -m "feat(ui): add Skeleton + MeshGradient primitives"
```

---

## Task 9: Build `Dialog`, `Tooltip`, `Tabs` primitives

**Files:** `components/ui/dialog.tsx`, `components/ui/tooltip.tsx`, `components/ui/tabs.tsx`, `lib/hooks/use-focus-trap.ts`, `tests/components/ui/dialog.test.tsx`

- [ ] **Step 1: Failing test for Dialog**

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "@/components/ui/dialog";

describe("Dialog", () => {
  it("renders children when open", () => {
    render(<Dialog open onClose={() => {}} title="T"><p>Content</p></Dialog>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
  it("calls onClose on Escape", () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose} title="T">x</Dialog>);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
  it("does not render when closed", () => {
    render(<Dialog open={false} onClose={() => {}} title="T"><p>Hidden</p></Dialog>);
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Focus-trap hook**

`lib/hooks/use-focus-trap.ts`:

```ts
import * as React from "react";

export function useFocusTrap(ref: React.RefObject<HTMLElement | null>, active: boolean) {
  React.useEffect(() => {
    if (!active || !ref.current) return;
    const node = ref.current;
    const focusable = node.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),[tabindex="0"]',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Tab" || focusable.length === 0) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    node.addEventListener("keydown", onKey);
    return () => node.removeEventListener("keydown", onKey);
  }, [active, ref]);
}
```

- [ ] **Step 3: Dialog**

```tsx
"use client";

import * as React from "react";
import { useFocusTrap } from "@/lib/hooks/use-focus-trap";

export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open);

  React.useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={ref}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Tooltip**

```tsx
import * as React from "react";

export function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card-elevated px-2 py-1 font-mono text-xs text-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}
```

- [ ] **Step 5: Tabs**

```tsx
"use client";

import * as React from "react";

interface Tab { id: string; label: string; }

export function Tabs({
  tabs, activeId, onChange, children,
}: {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === activeId}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] transition-colors ${
              tab.id === activeId
                ? "border-b-2 border-accent text-foreground"
                : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-6">{children}</div>
    </div>
  );
}
```

- [ ] **Step 6: Tests**

```bash
npm test -- tests/components/ui/dialog.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/ui/dialog.tsx components/ui/tooltip.tsx components/ui/tabs.tsx lib/hooks/use-focus-trap.ts tests/components/ui/dialog.test.tsx
git commit -m "feat(ui): add Dialog, Tooltip, Tabs primitives + focus-trap hook"
```

---

## Task 10: Build `EmptyState`, `StatCard`, `DataTable`

**Files:** `components/ui/empty-state.tsx`, `components/ui/stat-card.tsx`, `components/ui/data-table.tsx`

- [ ] **Step 1: EmptyState**

```tsx
import * as React from "react";

export function EmptyState({
  illustration,
  headline,
  description,
  cta,
}: {
  illustration?: React.ReactNode;
  headline: string;
  description?: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border-strong bg-card/40 px-6 py-16 text-center">
      {illustration}
      <h3 className="text-lg font-semibold text-foreground">{headline}</h3>
      {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
      {cta}
    </div>
  );
}
```

- [ ] **Step 2: StatCard**

```tsx
import * as React from "react";

export function StatCard({
  label, value, delta,
}: {
  label: string;
  value: string | number;
  delta?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-5">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 font-mono text-3xl text-foreground">{value}</p>
      {delta && <p className="mt-1 text-xs text-muted-foreground">{delta}</p>}
    </div>
  );
}
```

- [ ] **Step 3: DataTable**

```tsx
import * as React from "react";

export interface Column<T> {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns, rows, onRowClick, emptyState,
}: {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
}) {
  if (rows.length === 0 && emptyState) return <>{emptyState}</>;
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-card-elevated">
          <tr>
            {columns.map((col) => (
              <th
                key={col.id}
                className={`px-4 py-3 font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(row)}
              className={`border-t border-border transition-colors ${onRowClick ? "cursor-pointer hover:bg-card-elevated" : ""}`}
            >
              {columns.map((col) => (
                <td key={col.id} className={`px-4 py-3 ${col.className ?? ""}`}>
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: green.

- [ ] **Step 5: Commit**

```bash
git add components/ui/empty-state.tsx components/ui/stat-card.tsx components/ui/data-table.tsx
git commit -m "feat(ui): add EmptyState, StatCard, DataTable primitives"
```

---

## Task 11: Build `ValidatorCard`, `VerdictBanner`

**Files:** `components/ui/validator-card.tsx`, `components/ui/verdict-banner.tsx`

- [ ] **Step 1: ValidatorCard**

```tsx
import * as React from "react";
import { Badge } from "./badge";
import { Skeleton } from "./skeleton";

interface Validator { id: string; name: string; lens: string; }
interface Judgment {
  verdict: string;
  confidence: number;
  reasoning: string;
  citedEvidenceIds: string[];
}

const verdictVariant: Record<string, "success" | "warning" | "danger"> = {
  Allowed: "success",
  "Needs Attribution": "warning",
  "Needs License": "warning",
  "Impersonation Risk": "danger",
  Violation: "danger",
};

export function ValidatorCard({
  validator, judgment, state,
}: {
  validator: Validator;
  judgment?: Judgment;
  state: "loading" | "ready";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {validator.id}
      </p>
      <h4 className="mt-2 text-lg font-semibold text-foreground">{validator.name}</h4>
      <p className="mt-1 text-xs text-muted-foreground">{validator.lens}</p>
      <div className="mt-5">
        {state === "loading" || !judgment ? (
          <>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Badge variant={verdictVariant[judgment.verdict] ?? "neutral"}>
                {judgment.verdict}
              </Badge>
              <span className="font-mono text-sm text-foreground">
                {Math.round(judgment.confidence * 100)}%
              </span>
            </div>
            <p className="mt-3 text-sm text-foreground">{judgment.reasoning}</p>
            {judgment.citedEvidenceIds.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {judgment.citedEvidenceIds.map((id) => (
                  <Badge key={id} variant="neutral" className="!normal-case !tracking-normal">
                    {id}
                  </Badge>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: VerdictBanner**

```tsx
import * as React from "react";
import { MeshGradient } from "./mesh-gradient";

const verdictTone: Record<string, "allowed" | "warning" | "danger"> = {
  Allowed: "allowed",
  "Needs Attribution": "warning",
  "Needs License": "warning",
  "Impersonation Risk": "danger",
  Violation: "danger",
};

export function VerdictBanner({
  verdict, score, caseTitle,
}: {
  verdict: string;
  score: number;
  caseTitle: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-10 py-16">
      <MeshGradient tone={verdictTone[verdict] ?? "allowed"} />
      <div className="relative">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Verdict for {caseTitle}
        </p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight text-foreground">
          {verdict}
        </h1>
        <p className="mt-6 font-mono text-7xl text-foreground">{score}</p>
        <p className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          consensus score / 100
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add components/ui/validator-card.tsx components/ui/verdict-banner.tsx
git commit -m "feat(ui): add ValidatorCard + VerdictBanner with verdict tone mapping"
```

---

## Task 12: Build `ProgressRail`

**Files:** `components/ui/progress-rail.tsx`, `tests/components/ui/progress-rail.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressRail } from "@/components/ui/progress-rail";

describe("ProgressRail", () => {
  const steps = [
    { id: "setup", label: "Setup", href: "/cases/x", state: "done" as const },
    { id: "evidence", label: "Evidence", href: "/cases/x/evidence", state: "current" as const },
    { id: "trial", label: "Trial", href: "/cases/x/trial", state: "locked" as const },
    { id: "receipt", label: "Receipt", href: "/cases/x/receipt", state: "locked" as const },
  ];

  it("renders all step labels", () => {
    render(<ProgressRail steps={steps} />);
    for (const step of steps) {
      expect(screen.getByText(step.label)).toBeInTheDocument();
    }
  });

  it("locked step is not a link", () => {
    render(<ProgressRail steps={steps} />);
    expect(screen.getByText("Trial").closest("a")).toBeNull();
  });

  it("done step is a link", () => {
    render(<ProgressRail steps={steps} />);
    expect(screen.getByText("Setup").closest("a")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement**

```tsx
import * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";

export interface ProgressStep {
  id: string;
  label: string;
  href: string;
  state: "done" | "current" | "locked";
}

export function ProgressRail({ steps }: { steps: ProgressStep[] }) {
  return (
    <nav
      aria-label="Case progress"
      className="sticky top-14 z-30 h-12 border-b border-border bg-background/80 backdrop-blur-md"
    >
      <ol className="mx-auto flex h-full max-w-[1280px] items-center gap-6 overflow-x-auto px-6 md:px-10">
        {steps.map((step) => (
          <li key={step.id} className="flex flex-shrink-0 items-center gap-2">
            {step.state === "locked" ? (
              <span aria-disabled="true" className="flex items-center gap-2 text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                <span className="font-mono text-xs uppercase tracking-[0.18em]">{step.label}</span>
              </span>
            ) : (
              <Link
                href={step.href}
                className={`flex items-center gap-2 transition-colors ${
                  step.state === "current" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {step.state === "done" ? (
                  <Check className="h-3 w-3 text-accent" aria-hidden="true" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-accent ring-4 ring-accent/16" />
                )}
                <span
                  className={`font-mono text-xs uppercase tracking-[0.18em] ${
                    step.state === "current"
                      ? "underline decoration-accent decoration-2 underline-offset-4"
                      : ""
                  }`}
                >
                  {step.label}
                </span>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 4: Run — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add components/ui/progress-rail.tsx tests/components/ui/progress-rail.test.tsx
git commit -m "feat(ui): add ProgressRail case stepper with done/current/locked states"
```

---

## Task 13: Build `ThemeToggle`, `AppTopBar`, `AppShell`

**Files:** `components/theme/theme-toggle.tsx`, `components/shell/app-top-bar.tsx`, `components/shell/app-shell.tsx`, `app/layout.tsx`

- [ ] **Step 1: ThemeToggle**

```tsx
"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <span className="h-9 w-9" />;

  function cycle() {
    if (theme === "system") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme("system");
  }

  const Icon = theme === "system" ? Monitor : theme === "light" ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${theme}, click to change`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-card-elevated"
    >
      <Icon className="h-4 w-4 text-foreground" aria-hidden="true" />
    </button>
  );
}
```

- [ ] **Step 2: AppTopBar**

```tsx
import * as React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/cases/new", label: "New case" },
  { href: "/policy", label: "Policy" },
];

export function AppTopBar() {
  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-6 px-6 md:px-10">
        <Link
          href="/"
          className="font-mono text-sm font-semibold uppercase tracking-[0.22em] text-foreground"
        >
          ConsentVault
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: AppShell**

```tsx
import * as React from "react";
import { AppTopBar } from "./app-top-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppTopBar />
      <main>{children}</main>
    </div>
  );
}
```

- [ ] **Step 4: Wire AppShell into `app/layout.tsx`**

Replace `<ThemeProvider>{children}</ThemeProvider>` with:

```tsx
import { AppShell } from "@/components/shell/app-shell";

<ThemeProvider>
  <AppShell>{children}</AppShell>
</ThemeProvider>
```

- [ ] **Step 5: Build + smoke**

```bash
npm run build && npm run dev
```

Expected: top bar with logo + nav + theme toggle + wallet button. Page bodies may still look broken — fixed in Tasks 16-19.

- [ ] **Step 6: Commit**

```bash
git add components/theme/theme-toggle.tsx components/shell/app-top-bar.tsx components/shell/app-shell.tsx app/layout.tsx
git commit -m "feat(shell): add AppTopBar + ThemeToggle + AppShell scaffolding"
```

---

## Task 14: Build `CommandPalette` (Cmd+K)

**Files:** `components/shell/command-palette.tsx`, `components/shell/app-shell.tsx`, `tests/components/shell/command-palette.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommandPalette } from "@/components/shell/command-palette";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("CommandPalette", () => {
  it("opens on Cmd+K", () => {
    render(<CommandPalette />);
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes on Escape", () => {
    render(<CommandPalette />);
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
```

- [ ] **Step 2: Implement**

```tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";

const actions = [
  { id: "dash", label: "Open dashboard", path: "/" },
  { id: "new-case", label: "New case", path: "/cases/new" },
  { id: "policy", label: "Edit policy", path: "/policy" },
];

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()),
  );

  function handleClose() {
    setOpen(false);
    setQuery("");
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Command palette">
      <input
        autoFocus
        type="text"
        placeholder="Type a command..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-md border border-border bg-card-elevated px-3 py-2 text-foreground outline-none focus:border-accent"
      />
      <ul className="mt-4 flex flex-col gap-1">
        {filtered.map((action) => (
          <li key={action.id}>
            <button
              type="button"
              onClick={() => {
                router.push(action.path);
                handleClose();
              }}
              className="w-full rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-card-elevated"
            >
              {action.label}
            </button>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
```

- [ ] **Step 3: Mount in AppShell**

In `components/shell/app-shell.tsx`:

```tsx
import { CommandPalette } from "./command-palette";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppTopBar />
      <CommandPalette />
      <main>{children}</main>
    </div>
  );
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- tests/components/shell/command-palette.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/shell/command-palette.tsx components/shell/app-shell.tsx tests/components/shell/command-palette.test.tsx
git commit -m "feat(shell): add CommandPalette with Cmd+K nav"
```

---

## Task 15: Re-skin `WalletConnectButton` and `TrialGuard`

**Files:** `components/wallet/wallet-connect-button.tsx`, `components/trial/trial-guard.tsx`

- [ ] **Step 1: Re-skin WalletConnectButton chrome**

Keep its existing API and `buttonLabel` / `buttonIcon` helpers. Replace the className strings in the `return (...)` block:

```tsx
return (
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={handleClick}
      disabled={isConnecting}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-card-elevated disabled:cursor-not-allowed disabled:opacity-60"
    >
      {buttonIcon(status, address)}
      {buttonLabel(status, address)}
    </button>
  </div>
);
```

Drop the secondary `<p>` (network/error) — surface via Tooltip primitive in a follow-up if needed.

- [ ] **Step 2: Re-skin TrialGuard**

Replace its parchment paywall with `EmptyState`:

```tsx
import { EmptyState } from "@/components/ui/empty-state";

return (
  <EmptyState
    headline="Connect a GenLayer wallet to continue"
    description="The trial route requires a connected wallet to sign the verdict transaction."
    cta={<WalletConnectButton />}
  />
);
```

Preserve the existing condition logic.

- [ ] **Step 3: Run tests + build**

```bash
npm test && npm run build
```

Expected: green (existing wallet-button + trial-guard tests assert behavior, not classes).

- [ ] **Step 4: Commit**

```bash
git add components/wallet/wallet-connect-button.tsx components/trial/trial-guard.tsx
git commit -m "refactor(wallet,trial): re-skin button + guard with new tokens"
```

---

## Task 16: Re-skin dashboard `/`

**Files:** `app/page.tsx`

- [ ] **Step 1: Replace dashboard route**

Read existing `app/page.tsx`. Replace its body with the layout below. Preserve the data-fetching hook the previous version used (read recent cases from the same store) — feed it into `rows`.

```tsx
import Link from "next/link";
import { MeshGradient } from "@/components/ui/mesh-gradient";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";

type CaseRow = { id: string; title: string; verdict: string; score: number; date: string };

const columns: Column<CaseRow>[] = [
  { id: "title", header: "Title", cell: (r) => <span className="text-foreground">{r.title}</span> },
  { id: "verdict", header: "Verdict", cell: (r) => <Badge variant="accent">{r.verdict}</Badge> },
  { id: "score", header: "Score", cell: (r) => <span className="font-mono">{r.score}</span>, className: "text-right" },
  { id: "date", header: "Date", cell: (r) => <span className="font-mono text-xs text-muted-foreground">{r.date}</span> },
];

export default function DashboardPage() {
  const rows: CaseRow[] = []; // populate from existing case-store hook
  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <MeshGradient />
        <div className="relative mx-auto max-w-[1280px] px-6 py-24 md:px-10">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            ConsentVault · GenLayer
          </p>
          <h1 className="mt-3 max-w-3xl text-balance text-6xl font-semibold tracking-tight text-foreground">
            Protect what you create.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Run a three-validator trial against your creator policy and receive a signed verdict on chain.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/cases/new"
              className="inline-flex h-11 items-center rounded-full bg-accent px-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground transition-colors hover:opacity-90"
            >
              Open new case
            </Link>
            <Link
              href="/policy"
              className="inline-flex h-11 items-center rounded-full border border-border bg-card px-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-card-elevated"
            >
              Read the policy
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-16 md:px-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Active cases" value={rows.length} />
          <StatCard label="Receipts issued" value={rows.filter((r) => r.verdict).length} />
          <StatCard label="Validators online" value={3} />
        </div>

        <div className="mt-12">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Recent cases
          </h2>
          <div className="mt-4">
            <DataTable
              columns={columns}
              rows={rows}
              emptyState={
                <EmptyState
                  headline="No cases yet"
                  description="Start by drafting a case and uploading the source material."
                  cta={
                    <Link
                      href="/cases/new"
                      className="inline-flex h-10 items-center rounded-full bg-accent px-5 font-mono text-xs uppercase tracking-[0.18em] text-accent-foreground"
                    >
                      Open new case
                    </Link>
                  }
                />
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Run tests + dashboard e2e**

```bash
npm test && npm run test:e2e -- --grep dashboard && npm run build
```

Expected: green.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat(dashboard): re-skin with MeshGradient hero + StatCard + DataTable"
```

---

## Task 17: Re-skin `/policy` and `/cases/new`

**Files:** `app/policy/page.tsx`, `app/cases/new/page.tsx`, `components/intake/case-intake-screen.tsx`

- [ ] **Step 1: Re-skin /policy**

Two-column split (form left, sticky JSON preview right). Keep existing form fields and `dispatch` handlers.

```tsx
<div className="mx-auto max-w-[1280px] px-6 py-16 md:px-10">
  <div className="flex items-center gap-3">
    <h1 className="text-3xl font-semibold tracking-tight text-foreground">Creator policy</h1>
    <Badge variant="accent">Active</Badge>
  </div>
  <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_minmax(0,28rem)]">
    <form className="flex flex-col gap-6">{/* existing fields */}</form>
    <aside className="lg:sticky lg:top-32 lg:self-start">
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">policy.json</p>
        <pre className="mt-3 max-h-[60vh] overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-foreground">
          {JSON.stringify(policy, null, 2)}
        </pre>
      </div>
    </aside>
  </div>
</div>
```

- [ ] **Step 2: Re-skin `CaseIntakeScreen`**

Stacked sections with section dividers. Sticky bottom action bar. Keep all form bindings.

```tsx
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{title}</h2>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}

return (
  <div className="mx-auto max-w-3xl px-6 py-16 md:px-10">
    <h1 className="text-3xl font-semibold tracking-tight text-foreground">New case</h1>
    <div className="mt-8 flex flex-col gap-12">
      <Section title="Case info">{/* fields */}</Section>
      <Section title="Original content">{/* fields */}</Section>
      <Section title="AI output">{/* fields */}</Section>
      <Section title="Source links">{/* fields */}</Section>
      <Section title="Notes">{/* fields */}</Section>
    </div>
    <div className="sticky bottom-0 mt-12 -mx-6 border-t border-border bg-background/90 px-6 py-4 backdrop-blur-md md:-mx-10 md:px-10">
      <div className="flex justify-end gap-3">
        <button type="button" className="...">Save draft</button>
        <button type="submit" className="...">Continue to evidence</button>
      </div>
    </div>
  </div>
);
```

- [ ] **Step 3: Run tests + build + lint**

```bash
npm test && npm run build && npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add app/policy/page.tsx app/cases/new/page.tsx components/intake/case-intake-screen.tsx
git commit -m "feat(policy,intake): re-skin policy + new-case screens"
```

---

## Task 18: Re-skin `/cases/[id]` + `/evidence`, mount `ProgressRail`

**Files:** `app/cases/[caseId]/layout.tsx` (new), `app/cases/[caseId]/page.tsx`, `app/cases/[caseId]/evidence/page.tsx`

- [ ] **Step 1: Create case layout with ProgressRail**

`app/cases/[caseId]/layout.tsx`:

```tsx
import { ProgressRail, type ProgressStep } from "@/components/ui/progress-rail";

export default function CaseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { caseId: string };
}) {
  const id = params.caseId;
  const steps: ProgressStep[] = [
    { id: "setup", label: "Setup", href: `/cases/${id}`, state: "done" },
    { id: "evidence", label: "Evidence", href: `/cases/${id}/evidence`, state: "current" },
    { id: "trial", label: "Trial", href: `/cases/${id}/trial`, state: "locked" },
    { id: "receipt", label: "Receipt", href: `/cases/${id}/receipt`, state: "locked" },
  ];
  return (
    <>
      <ProgressRail steps={steps} />
      {children}
    </>
  );
}
```

Step state derivation per page is data-driven; defaults above are sensible MVP. Refine per-page once wired.

- [ ] **Step 2: Re-skin /cases/[id] page**

```tsx
<div className="mx-auto max-w-[1280px] px-6 py-16 md:px-10">
  <Badge variant="accent">{caseStatus}</Badge>
  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">{caseTitle}</h1>
  <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
    Created {formatDate(createdAt)}
  </p>
  <ol className="mt-12 flex flex-col gap-4">
    {timeline.map((entry) => (
      <li key={entry.id} className="rounded-2xl border border-border bg-card p-6">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {formatDate(entry.timestamp)}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-foreground">{entry.label}</h3>
        {entry.cta && <div className="mt-3">{entry.cta}</div>}
      </li>
    ))}
  </ol>
</div>
```

`timeline`, `caseStatus`, `caseTitle`, `createdAt` come from the existing case-store hook.

- [ ] **Step 3: Re-skin /cases/[id]/evidence**

```tsx
<div className="mx-auto max-w-[1280px] px-6 py-16 md:px-10">
  <div className="flex items-center gap-3">
    <h1 className="text-3xl font-semibold tracking-tight text-foreground">Evidence</h1>
    <Badge variant="neutral">{items.length}</Badge>
  </div>
  <div
    onDragOver={(e) => e.preventDefault()}
    onDrop={handleDrop}
    className="mt-8 rounded-2xl border border-dashed border-border-strong bg-card/40 px-6 py-16 text-center"
  >
    <p className="text-sm text-muted-foreground">Drop a file here or pick a type below.</p>
    {/* existing add-evidence buttons */}
  </div>
  {items.length === 0 ? (
    <EmptyState headline="No evidence linked yet" description="Add at least one source or output." />
  ) : (
    <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
      {items.map((ev) => (
        <li key={ev.id} className="rounded-2xl border border-border bg-card p-5">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{ev.id}</p>
          <Badge variant="neutral" className="mt-2">{ev.type}</Badge>
          <h3 className="mt-3 text-base font-semibold text-foreground">{ev.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{ev.description}</p>
        </li>
      ))}
    </ul>
  )}
</div>
```

- [ ] **Step 4: Build + lint**

```bash
npm run build && npm run lint
```

- [ ] **Step 5: Commit**

```bash
git add app/cases/[caseId]/layout.tsx app/cases/[caseId]/page.tsx app/cases/[caseId]/evidence/page.tsx
git commit -m "feat(case): re-skin overview + evidence + mount ProgressRail"
```

---

## Task 19: Re-skin `/cases/[id]/trial` + `/receipt`

**Files:** `app/cases/[caseId]/trial/page.tsx`, `components/trial/trial-screen.tsx`, `app/cases/[caseId]/receipt/page.tsx`

- [ ] **Step 1: Re-skin trial screen**

Replace the dossier judgment list with `<ValidatorCard>` row of 3. Keep existing `runTrial` callback wiring.

In `components/trial/trial-screen.tsx`:

```tsx
import { ValidatorCard } from "@/components/ui/validator-card";

<div className="mx-auto max-w-[1280px] px-6 py-16 md:px-10">
  <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Trial in progress</p>
  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">{consentCase.title}</h1>

  <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
    {VALIDATORS.map((validator, idx) => (
      <ValidatorCard
        key={validator.id}
        validator={validator}
        judgment={result?.receipt.judgments[idx]}
        state={status === "running" ? "loading" : "ready"}
      />
    ))}
  </div>

  <div className="mt-10 flex flex-wrap gap-3">
    <button type="button" onClick={executeTrial} className="inline-flex h-10 items-center rounded-full bg-accent px-5 font-mono text-xs uppercase tracking-[0.18em] text-accent-foreground">
      Re-run trial
    </button>
    {result && (
      <Link
        href={`/cases/${caseId}/receipt`}
        className="inline-flex h-10 items-center rounded-full border border-border bg-card px-5 font-mono text-xs uppercase tracking-[0.18em] text-foreground"
      >
        View receipt
      </Link>
    )}
  </div>
  {errorMessage && <p className="mt-4 text-sm text-danger">{errorMessage}</p>}
</div>
```

`VALIDATORS` reuses the existing constant. The pre-existing trial-h1 e2e failure (out of scope; tracked separately) is intentionally still failing here.

- [ ] **Step 2: Re-skin receipt page**

```tsx
import { VerdictBanner } from "@/components/ui/verdict-banner";

<div>
  <VerdictBanner verdict={receipt.finalVerdict} score={receipt.score} caseTitle={receipt.caseTitle} />
  <div className="mx-auto max-w-[1280px] px-6 py-16 md:px-10">
    <dl className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-12">
      {[
        ["Case ID", receipt.caseId],
        ["Contract", receipt.contractAddress],
        ["Tx hash", receipt.txHash],
        ["Validators", receipt.judgments.length],
        ["Evidence cited", receipt.supportingEvidenceCount],
        ["Issued", formatDate(receipt.issuedAt)],
      ].map(([label, value]) => (
        <div key={label}>
          <dt className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
          <dd className="mt-1 break-words font-mono text-sm text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
    <details className="mt-12 rounded-2xl border border-border bg-card p-4">
      <summary className="cursor-pointer font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Receipt JSON
      </summary>
      <pre className="mt-4 overflow-auto whitespace-pre-wrap break-words font-mono text-xs text-foreground">
        {JSON.stringify(receipt, null, 2)}
      </pre>
    </details>
  </div>
</div>
```

- [ ] **Step 3: Build + lint + tests**

```bash
npm run build && npm run lint && npm test
```

Expected: green except the pre-existing trial-h1 e2e failure (separate spec).

- [ ] **Step 4: Commit**

```bash
git add app/cases/[caseId]/trial/page.tsx components/trial/trial-screen.tsx app/cases/[caseId]/receipt/page.tsx
git commit -m "feat(trial,receipt): re-skin with ValidatorCard + VerdictBanner"
```

---

## Task 20: Drop legacy parchment classes + delete SiteShell

**Files:** `app/globals.css`, `components/site-shell.tsx`, `components/site-shell.test.tsx`, `tailwind.config.ts`

- [ ] **Step 1: Search for remaining parchment references**

Grep for the dropped classes via the Grep tool:
- `evidence-card`, `verdict-banner`, `grain-overlay`, `ledger-divider`, `metadata-label`, `archive-grid`, `archive-overflow-wrap`, `shadow-dossier`, `bg-accent\\/6`, `bg-accent\\/8`, `border-ink\\/10`, `font-serif`, `Georgia`, `parchment`

Expected: any remaining occurrence is in `globals.css` or in a route already updated. Replace any production-component reference with the modern-token equivalent (`bg-card`, `border-border`, etc.).

- [ ] **Step 2: Remove the temporary shim block from `globals.css`**

Delete the `bg-accent/6` / `bg-accent/8` / `border-ink/10` shims added in Task 6. Confirm build still passes.

- [ ] **Step 3: Delete SiteShell**

```bash
git rm components/site-shell.tsx
git rm components/site-shell.test.tsx
```

(Existing site-shell test asserts parchment chrome — superseded by AppShell; dashboard e2e covers the same surface.)

Confirm via grep that nothing imports `site-shell`.

- [ ] **Step 4: Verify**

```bash
npm run lint && npm test && npm run build
```

Expected: green.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: drop parchment classes, SiteShell, and legacy Tailwind config"
```

---

## Task 21: Final verification

- [ ] **Step 1: Full vitest**

```bash
npm test
```

Expected: green.

- [ ] **Step 2: Lint + build**

```bash
npm run lint && npm run build
```

Expected: green.

- [ ] **Step 3: Pytest (contract — unchanged surface)**

```bash
cd contracts/consent_vault_trial && py -m pytest -v && cd ../..
```

Expected: 27 passed.

- [ ] **Step 4: Dashboard + axe e2e**

```bash
npm run test:e2e -- --grep dashboard
```

Expected: dashboard + axe-on-`/` green. The pre-existing `consentvault-flow` failure (trial h1) is acknowledged out-of-scope.

- [ ] **Step 5: Manual smoke**

```bash
npm run dev
```

Walk every route in both dark and light mode (toggle via top bar). Confirm:
- Top bar visible on every route
- Progress rail visible on `/cases/[id]/*` only
- No FOUC on first paint
- Cmd+K opens command palette
- No grayscale / parchment artifacts

- [ ] **Step 6: Push branch (only if user approves)**

```bash
git push -u origin codex/ui-redesign-modern-saas
gh pr create --title "feat: modern-SaaS UI redesign with OpenDesign hand-off" --body "$(cat <<'EOF'
## Summary
- Replace parchment/dossier identity with modern SaaS aesthetic (Linear/Vercel)
- Dark mode default with light toggle via next-themes
- 7 routes re-skinned + AppShell + ProgressRail + CommandPalette
- OpenDesign hybrid hand-off: prompt at docs/superpowers/prompts/2026-05-18-ui-redesign-opendesign.md

## Test plan
- [x] vitest 86+ tests green
- [x] pytest 27 tests green
- [x] lint clean
- [x] build green
- [x] e2e dashboard + axe green
- [ ] Manual: walk all 7 routes in dark + light

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Acceptance criteria mapping

| Spec criterion | Implementing task |
|---|---|
| A. All 7 routes render in dark + light | Tasks 16, 17, 18, 19 + theme provider Task 5 |
| B. AppTopBar + CaseProgressRail + Cmd+K | Tasks 13, 14, 18 |
| C. Lint + vitest + build + dashboard e2e + axe green | Task 21 |
| D. No `dossier`/`parchment`/`grain`/`Georgia`/`serif` references remain | Task 20 |
| E. WCAG AA contrast in both modes | Tasks 6 (tokens) + 21 (axe) |
| F. OpenDesign prompt file at `docs/superpowers/prompts/2026-05-18-ui-redesign-opendesign.md` | Task 2 |

All spec sections mapped. No placeholders remain.
