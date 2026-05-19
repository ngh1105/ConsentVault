import * as React from "react";

export function StatCard({
  label, value, delta,
}: {
  label: string;
  value: string | number;
  delta?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-5">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 font-mono text-3xl text-foreground">{value}</p>
      {delta && <p className="mt-1 text-xs text-muted-foreground">{delta}</p>}
    </div>
  );
}
