import * as React from "react";

export function EmptyState({
  illustration,
  headline,
  description,
  cta,
}: {
  illustration?: React.ReactNode;
  headline: string;
  description?: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border-strong bg-card/40 px-6 py-16 text-center">
      {illustration}
      <h3 className="text-lg font-semibold text-foreground">{headline}</h3>
      {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
      {cta}
    </div>
  );
}
