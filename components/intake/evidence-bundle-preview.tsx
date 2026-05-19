import { AlertTriangle, ExternalLink, FileArchive } from "lucide-react";
import { assessExternalUrl, type EvidencePreviewItem } from "@/lib/case-intake";

type EvidenceBundlePreviewProps = {
  items: EvidencePreviewItem[];
};

export function EvidenceBundlePreview({ items }: EvidenceBundlePreviewProps) {
  const hasExactPreviewCount = items.length === 3;
  const isEmpty = items.length === 0;
  const headline = isEmpty
    ? "No records yet"
    : `${items.length} record${items.length === 1 ? "" : "s"} ready to file`;

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <FileArchive className="h-5 w-5 text-accent" aria-hidden="true" />
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Evidence bundle preview</p>
          <h2 className="mt-3 text-3xl font-semibold">{headline}</h2>
        </div>
      </div>

      {!hasExactPreviewCount ? (
        <div className="mt-6 rounded-[1.2rem] border border-accent/20 bg-accent/10 px-4 py-3 text-sm leading-6 text-foreground">
          {isEmpty
            ? "No evidence records are available yet. Add the source, AI output, and platform listing to restore the three-card preview."
            : `Expected exactly 3 evidence records before filing, but received ${items.length}.`}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4">
        {items.map((item) => {
          const previewText = item.previewUrlText ?? item.url;
          const previewUrl = assessExternalUrl(previewText);

          return (
            <article
              key={item.id}
              className="rounded-[1.45rem] border border-border/80 bg-background p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-foreground">
                    {item.type}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-semibold">{item.title}</h3>
                </div>
                <span className="rounded-full border border-border/80 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  {item.capturedAt}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-foreground">{item.description}</p>
              <p
                className={previewUrl.status === "invalid"
                  ? "mt-4 break-all rounded-[1rem] border border-amber-700/15 bg-amber-600/10 px-3 py-2 text-sm leading-6 text-amber-900"
                  : "mt-4 break-all text-sm leading-6 text-muted-foreground"}
              >
                {previewText || "URL pending"}
              </p>

              {previewUrl.status === "valid" ? (
                <a
                  href={previewUrl.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-foreground transition hover:border-accent/30 hover:bg-accent/12"
                >
                  Open source
                  <ExternalLink className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                </a>
              ) : null}

              {previewUrl.status === "invalid" ? (
                <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-amber-900">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  Invalid or unsupported URL
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
