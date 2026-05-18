"use client";

import { Clock3, Link2, NotebookText } from "lucide-react";
import type { ConsentCase } from "@/lib/domain";
import { assessExternalUrl } from "@/lib/case-intake";

type EvidenceTimelineProps = {
  evidenceItems: ConsentCase["evidenceItems"];
};

function renderUrl(url: string) {
  const assessment = assessExternalUrl(url);

  if (assessment.status === "valid") {
    return (
      <a
        href={assessment.href}
        target="_blank"
        rel="noreferrer"
        className="break-all text-accent underline decoration-accent/30 underline-offset-4 transition hover:decoration-accent"
      >
        {assessment.normalized}
      </a>
    );
  }

  return <span className="break-all text-foreground">{url || "No external URL archived"}</span>;
}

export function EvidenceTimeline({ evidenceItems }: EvidenceTimelineProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Evidence timeline</p>
          <h2 className="mt-4 text-3xl font-semibold">Archive capture log</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Each record preserves source type, capture time, descriptive note, and the original archived URL when it is safe to open.
          </p>
        </div>
        <Clock3 className="mt-1 h-5 w-5 text-accent" aria-hidden="true" />
      </div>

      <ol className="mt-6 space-y-4" aria-label="Evidence items timeline">
        {evidenceItems.map((item, index) => (
          <li key={item.id} className="relative rounded-[1.7rem] border border-border/80 bg-background/70 p-5 pl-6 sm:pl-8">
            <div className="absolute left-4 top-6 h-[calc(100%-1.5rem)] w-px bg-[linear-gradient(180deg,hsl(var(--accent)/0.28),transparent)] sm:left-5" />
            <div className="absolute left-[0.72rem] top-5 h-5 w-5 rounded-full border border-accent/30 bg-card shadow-sm sm:left-[0.95rem]">
              <div className="m-[5px] h-2 w-2 rounded-full bg-accent" />
            </div>

            <div className="flex flex-wrap items-start justify-between gap-3 pl-6 sm:pl-8">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-accent/15 bg-accent/10 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-accent">
                    {item.type}
                  </span>
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
                    Entry {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-2xl font-semibold">{item.title}</h3>
              </div>
              <div className="rounded-[1.1rem] border border-border/70 bg-card/70 px-3 py-2 text-right text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {item.capturedAt}
              </div>
            </div>

            <dl className="mt-5 grid gap-4 pl-6 text-sm leading-6 sm:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] sm:pl-8">
              <div className="rounded-[1.2rem] border border-border/70 bg-card/75 p-4">
                <dt className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  <Link2 className="h-4 w-4 text-accent" aria-hidden="true" />
                  Archived URL
                </dt>
                <dd className="mt-3">{renderUrl(item.url)}</dd>
              </div>
              <div className="rounded-[1.2rem] border border-border/70 bg-card/75 p-4">
                <dt className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  <NotebookText className="h-4 w-4 text-accent" aria-hidden="true" />
                  Description
                </dt>
                <dd className="mt-3 text-foreground">{item.description}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
    </section>
  );
}
