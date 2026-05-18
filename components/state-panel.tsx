import Link from "next/link";
import { LoaderCircle } from "lucide-react";

type StatePanelProps = {
  label: string;
  title: string;
  description: string;
  href?: string;
  actionLabel?: string;
  loading?: boolean;
};

export function StatePanel({
  label,
  title,
  description,
  href,
  actionLabel,
  loading = false,
}: StatePanelProps) {
  return (
    <section
      className="rounded-2xl border border-border bg-card p-5 mx-auto flex w-full max-w-3xl flex-col gap-5 px-5 py-8 sm:px-8 sm:py-10"
      aria-live={loading ? "polite" : undefined}
      aria-busy={loading || undefined}
    >
      <div className="flex flex-wrap items-center gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        {loading ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/15 bg-accent/10 px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin text-accent" aria-hidden="true" />
            Loading archive
          </span>
        ) : null}
      </div>

      <div className="space-y-4">
        <h1 className="max-w-2xl font-display text-3xl font-semibold leading-tight text-balance sm:text-4xl md:text-5xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>

      {href && actionLabel ? (
        <div className="pt-1">
          <Link
            href={href}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 py-3 text-center font-mono text-xs font-semibold uppercase tracking-[0.22em] text-accent-foreground shadow-sm transition hover:translate-y-[-1px] hover:shadow-md"
          >
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
