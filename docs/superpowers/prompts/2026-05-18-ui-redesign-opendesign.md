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
