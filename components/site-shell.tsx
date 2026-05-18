import Link from "next/link";
import type { PropsWithChildren } from "react";
import { ArrowUpRight, ScrollText } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Navigation } from "@/components/navigation";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";

export function SiteShell({ children }: PropsWithChildren) {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <div className="grain-overlay pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(128,33,40,0.16),transparent_58%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-dossier flex-col px-3 py-4 sm:px-6 sm:py-5 lg:px-8">
        <header className="border-ink/10 bg-card/80 shadow-dossier supports-[backdrop-filter]:bg-card/68 mb-5 rounded-[2rem] border backdrop-blur sm:mb-6">
          <div className="flex flex-col gap-5 px-4 py-4 sm:px-7 sm:py-5 lg:flex-row lg:items-start lg:justify-between lg:px-8">
            <BrandMark titleAs="div" className="max-w-3xl" />

            <div className="flex flex-col gap-3 lg:max-w-xs lg:items-end lg:text-right">
              <WalletConnectButton />
              <Link
                href="/cases/new"
                className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-full bg-accent px-5 py-3 text-center font-mono text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md lg:self-auto"
              >
                New case intake
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <div className="inline-flex flex-wrap items-center gap-2 text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground lg:justify-end">
                <ScrollText className="h-4 w-4" aria-hidden="true" />
                Archive workflow live
              </div>
            </div>
          </div>

          <Navigation />
        </header>

        <div className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <main id="main-content" className="min-h-[30rem] min-w-0 sm:min-h-[36rem]">
            {children}
          </main>

          <aside className="min-w-0 space-y-4 xl:sticky xl:top-4 xl:self-start">
            <section className="verdict-banner p-5 text-accent-foreground sm:p-6">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-accent-foreground/80">
                Action rail
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Keep each dispute moving.</h2>
              <p className="mt-3 text-sm leading-6 text-accent-foreground/85">
                Open a case to review policy context, evidence count, and receipt links without losing the archive framing.
              </p>
            </section>

            <section className="evidence-card p-5">
              <p className="metadata-label">Routes in play</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground">
                <li className="rounded-[1.3rem] border border-border/80 bg-background/70 px-4 py-3">
                  Dashboard ledger and case summaries
                </li>
                <li className="rounded-[1.3rem] border border-border/80 bg-background/70 px-4 py-3">
                  Creator policy and new-case entry links
                </li>
                <li className="rounded-[1.3rem] border border-border/80 bg-background/70 px-4 py-3">
                  Case overview with evidence, trial, and receipt route handoffs
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
