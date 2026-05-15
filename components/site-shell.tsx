import Link from "next/link";
import type { PropsWithChildren } from "react";
import { ArrowUpRight, Gavel, ScrollText } from "lucide-react";

type NavigationItem = {
  label: string;
  href?: string;
};

const navigation: NavigationItem[] = [
  { href: "/", label: "Case Ledger" },
  { label: "Consent Policy" },
  { label: "File Dispute" },
];

const unavailableLabel = "Available in a later task";

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
              <button
                type="button"
                disabled
                aria-label={`File new case (${unavailableLabel.toLowerCase()})`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground opacity-60"
              >
                File new case
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <div className="flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                <ScrollText className="h-4 w-4" aria-hidden="true" />
                {unavailableLabel}
              </div>
            </div>
          </div>

          <nav aria-label="Primary" className="border-ink/10 border-t px-4 py-4 sm:px-6">
            <ul className="flex flex-wrap items-center gap-2">
              {navigation.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="rounded-full border border-transparent px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground transition hover:border-accent/20 hover:bg-accent/8 hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      aria-disabled="true"
                      className="inline-flex cursor-not-allowed rounded-full border border-transparent px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground opacity-60"
                      title={unavailableLabel}
                    >
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <main className="evidence-card min-h-[36rem] p-5 sm:p-7">{children}</main>

          <aside className="space-y-4">
            <section className="verdict-banner p-5 text-accent-foreground">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-accent-foreground/80">
                Tribunal preview
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold">Verdict-ready interface</h2>
              <p className="mt-3 text-sm leading-6 text-accent-foreground/85">
                Every route can inherit this framing to keep the archive feeling like one cohesive legal evidence workspace.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
