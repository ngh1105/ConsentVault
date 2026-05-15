import Link from "next/link";
import { ArrowRight, BadgeCheck, FileSearch, Landmark, Scale, ShieldAlert } from "lucide-react";

const sampleCases = [
  {
    title: "Voice clone promo on short-video platform",
    status: "Verdict Ready",
    verdict: "Impersonation Risk",
    note: "Synthetic voice ad mirrors creator cadence without license terms.",
  },
  {
    title: "Tutorial transcript remixed into chatbot guide",
    status: "In Review",
    verdict: "Needs Attribution",
    note: "Commercial summary reuses phrasing but dropped mandatory credit block.",
  },
  {
    title: "Fan dub repackaged as premium narration pack",
    status: "Draft",
    verdict: "Needs License",
    note: "Packaging appears monetized beyond the policy's personal-use carveout.",
  },
  {
    title: "Dataset excerpt mirrored in synthetic briefing",
    status: "Verdict Ready",
    verdict: "Violation",
    note: "Policy denies dataset republication and transformation for training corpora.",
  },
];

const workflowSignals = [
  {
    title: "Consent policies",
    description: "Record creator terms with blocked-use clauses, attribution rules, and jurisdiction notes.",
    icon: Landmark,
  },
  {
    title: "Evidence bundle",
    description: "Line up source, output, and platform traces in one archive-style workspace.",
    icon: FileSearch,
  },
  {
    title: "Tribunal verdict",
    description: "Simulate a multi-validator decision and export a shareable receipt.",
    icon: Scale,
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <article className="evidence-card p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="metadata-label">Task 1 scaffold</span>
            <span className="rounded-full border border-ink/10 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
              archive dashboard
            </span>
          </div>
          <h2 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight text-balance sm:text-5xl">
            A legal evidence archive for AI consent disputes.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            The landing shell establishes the parchment-and-ink identity for ConsentVault and previews the creator workflow: capture consent terms, file a suspicious output, compare evidence, and issue a scarlet verdict receipt.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/cases/new"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground transition hover:-translate-y-0.5 hover:bg-accent/90"
            >
              Create case
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/policy"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/10 bg-card/70 px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-foreground transition hover:border-accent/20 hover:text-accent"
            >
              Review policy shell
            </Link>
          </div>
        </article>

        <aside className="evidence-card p-6">
          <p className="metadata-label">Workflow frame</p>
          <div className="mt-5 space-y-4">
            {workflowSignals.map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-[1.4rem] border border-ink/10 bg-background/55 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full border border-accent/15 bg-accent/10 p-2 text-accent">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="metadata-label">Sample case grid</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">Dispute ledger preview</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Placeholder records show the shell can support mixed statuses and tribunal outcomes before the real store arrives in Task 2.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {sampleCases.map((item) => (
            <article key={item.title} className="evidence-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-2xl leading-tight">{item.title}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.note}</p>
                </div>
                <div className="space-y-2 text-right">
                  <span className="inline-flex rounded-full border border-accent/15 bg-accent/8 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.24em] text-accent">
                    {item.status}
                  </span>
                  <div className="flex items-center justify-end gap-2 text-sm text-foreground">
                    <BadgeCheck className="h-4 w-4 text-accent" aria-hidden="true" />
                    {item.verdict}
                  </div>
                </div>
              </div>
              <div className="ledger-divider my-5" />
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
                  Evidence intake placeholder
                </p>
                <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 px-3 py-2 text-xs text-muted-foreground">
                  <ShieldAlert className="h-4 w-4 text-accent" aria-hidden="true" />
                  Ready for overview route
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
