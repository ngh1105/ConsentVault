import { ExternalLink, FileArchive } from "lucide-react";
import type { EvidenceItem } from "@/lib/domain";

type EvidenceBundlePreviewProps = {
  items: EvidenceItem[];
};

export function EvidenceBundlePreview({ items }: EvidenceBundlePreviewProps) {
  const hasExactPreviewCount = items.length === 3;
  const isEmpty = items.length === 0;

  return (
    <section className="evidence-card p-6">
      <div className="flex items-center gap-3">
        <FileArchive className="h-5 w-5 text-accent" aria-hidden="true" />
        <div>
          <p className="metadata-label">Evidence bundle preview</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">Three records ready to file</h2>
        </div>
      </div>

      {!hasExactPreviewCount ? (
        <div className="mt-6 rounded-[1.2rem] border border-accent/20 bg-accent/8 px-4 py-3 text-sm leading-6 text-foreground">
          {isEmpty
            ? "No evidence records are available yet. Add the source, AI output, and platform listing to restore the three-card preview."
            : `Expected exactly 3 evidence records before filing, but received ${items.length}.`}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-[1.45rem] border border-border/80 bg-background/70 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-accent">
                  {item.type}
                </p>
                <h3 className="mt-3 font-display text-2xl font-semibold">{item.title}</h3>
              </div>
              <span className="rounded-full border border-border/80 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                {item.capturedAt}
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-foreground">{item.description}</p>
            <p className="mt-4 break-all text-sm leading-6 text-muted-foreground">{item.url || "URL pending"}</p>

            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/8 px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-foreground transition hover:border-accent/30 hover:bg-accent/12"
              >
                Open source
                <ExternalLink className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
