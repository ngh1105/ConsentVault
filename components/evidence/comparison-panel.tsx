"use client";

import { useId, useState } from "react";
import { PanelsTopLeft, ScrollText } from "lucide-react";
import type { ConsentCase } from "@/lib/domain";
import { cn } from "@/lib/utils";

type ComparisonPanelProps = {
  consentCase: ConsentCase;
};

type PaneKey = "source" | "output";

const panes: Array<{
  key: PaneKey;
  label: string;
  heading: string;
  body: (consentCase: ConsentCase) => string;
}> = [
  {
    key: "source",
    label: "Original content",
    heading: "Original creator record",
    body: (consentCase) => consentCase.originalContent,
  },
  {
    key: "output",
    label: "AI output",
    heading: "Synthetic output under review",
    body: (consentCase) => consentCase.aiOutput,
  },
];

export function ComparisonPanel({ consentCase }: ComparisonPanelProps) {
  const [activePane, setActivePane] = useState<PaneKey>("source");
  const panelId = useId();

  return (
    <section className="evidence-card p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="metadata-label">Source comparison</p>
          <h2 className="mt-4 font-display text-3xl font-semibold">Original record versus generated output</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Read the creator&apos;s original material against the disputed synthetic output without leaving the archive case file.
          </p>
        </div>
        <PanelsTopLeft className="mt-1 h-5 w-5 text-accent" aria-hidden="true" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2 lg:hidden" role="tablist" aria-label="Evidence comparison panes">
        {panes.map((pane) => {
          const isActive = activePane === pane.key;
          const tabId = `${panelId}-${pane.key}-tab`;
          const contentId = `${panelId}-${pane.key}-panel`;

          return (
            <button
              key={pane.key}
              id={tabId}
              type="button"
              role="tab"
              aria-controls={contentId}
              aria-selected={isActive}
              onClick={() => setActivePane(pane.key)}
              className={cn(
                "rounded-full border px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] transition focus-visible:outline-none",
                isActive
                  ? "border-accent/20 bg-accent/8 text-foreground"
                  : "border-border/80 bg-background/65 text-muted-foreground hover:border-accent/20 hover:bg-accent/6 hover:text-foreground",
              )}
            >
              {pane.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-4 lg:hidden">
        {panes.map((pane) => {
          const isActive = activePane === pane.key;
          const tabId = `${panelId}-${pane.key}-tab`;
          const contentId = `${panelId}-${pane.key}-panel`;

          return (
            <article
              key={pane.key}
              id={contentId}
              role="tabpanel"
              aria-labelledby={tabId}
              hidden={!isActive}
              className="rounded-[1.7rem] border border-border/80 bg-background/70 p-5"
            >
              <div className="flex items-center gap-2 text-accent">
                <ScrollText className="h-4 w-4" aria-hidden="true" />
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">{pane.label}</p>
              </div>
              <h3 className="mt-3 font-display text-2xl font-semibold">{pane.heading}</h3>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-foreground">{pane.body(consentCase)}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-6 hidden gap-4 lg:grid lg:grid-cols-2">
        {panes.map((pane) => (
          <article key={pane.key} className="rounded-[1.8rem] border border-border/80 bg-background/70 p-5 xl:p-6">
            <div className="flex items-center gap-2 text-accent">
              <ScrollText className="h-4 w-4" aria-hidden="true" />
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em]">{pane.label}</p>
            </div>
            <h3 className="mt-3 font-display text-2xl font-semibold">{pane.heading}</h3>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-foreground">{pane.body(consentCase)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
