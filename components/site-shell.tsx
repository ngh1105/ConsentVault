import Link from "next/link";
import type { PropsWithChildren } from "react";
import { ArrowUpRight, FileStack, Gavel, ScrollText } from "lucide-react";

const navigation = [
  { href: "/", label: "Case Ledger" },
  { href: "/policy", label: "Consent Policy" },
  { href: "/cases/new", label: "File Dispute" },
];

export function SiteShell({ children }: PropsWithChildren) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="grain-overlay pointer-events-none absolute inset-0" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-dossier flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="border-ink/10 bg-card/80 shadow-dossier supports-[backdrop-filter]:bg-card/65 mb-6 rounded-[2rem] border backdrop-blur">
          <div className="flex flex-col gap-5 px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] border border-accent/20 bg-accent/10 text-accent">
                <Gavel className="h-7 w-7" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="eyebrow text-muted-foreground">Hybrid consent registry</p>
                <Link href="/" className="inline-flex items-baseline gap-3">
                  <h1 className="font-display text-4xl font-semibold tracking-[0.02em] text-balance text-foreground sm:text-5xl">
                    ConsentVault
                  </h1>
                  <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-accent">
                    archive beta
                  </span>
                </Link>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Preserve creator consent terms, examine suspect AI outputs, and issue a shareable dispute record with tribunal-style confidence markers.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <Link
                href="/cases/new"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground transition hover:-translate-y-0.5 hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30"
              >
                File new case
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <div className="flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                <ScrollText className="h-4 w-4" aria-hidden="true" />
                Active review workspace
              </div>
            </div>
          </div>

          <div className="border-ink/10 flex flex-wrap items-center gap-2 border-t px-4 py-4 sm:px-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-transparent px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground transition hover:border-accent/20 hover:bg-accent/8 hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <main className="evidence-card min-h-[36rem] p-5 sm:p-7">{children}</main>

          <aside className="space-y-4">
            <section className="evidence-card p-5">
              <p className="metadata-label">Current docket</p>
              <div className="mt-4 space-y-4">
                <div className="rounded-[1.5rem] border border-accent/15 bg-accent/6 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-display text-2xl">04</span>
                    <FileStack className="h-5 w-5 text-accent" aria-hidden="true" />
                  </div>
                  <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">
                    Sample disputes loaded
                  </p>
                </div>
                <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                  <p>
                    The shell already carries the archive look-and-feel Task 1 needs: parchment surfaces, scarlet verdict accents, and mono metadata labels.
                  </p>
                  <p>
                    Task 2 will replace the temporary provider with a persistent consent ledger and live selectors.
                  </p>
                </div>
              </div>
            </section>

            <section className="verdict-banner p-5 text-accent-foreground">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-accent-foreground/80">
                Tribunal preview
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold">Verdict-ready interface</h2>
              <p className="mt-3 text-sm leading-6 text-accent-foreground/85">
                Every route can inherit this framing to keep the demo feeling like one cohesive legal evidence archive.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
