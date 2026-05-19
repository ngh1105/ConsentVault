import * as React from "react";
import { MeshGradient } from "./mesh-gradient";

const verdictTone: Record<string, "allowed" | "warning" | "danger"> = {
  Allowed: "allowed",
  "Needs Attribution": "warning",
  "Needs License": "warning",
  "Impersonation Risk": "danger",
  Violation: "danger",
};

export function VerdictBanner({
  verdict, score, caseTitle,
}: {
  verdict: string;
  score: number;
  caseTitle: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-10 py-16">
      <MeshGradient tone={verdictTone[verdict] ?? "allowed"} />
      <div className="relative">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Verdict for {caseTitle}
        </p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight text-foreground">
          {verdict}
        </h1>
        <p className="mt-6 font-mono text-7xl text-foreground">{score}</p>
        <p className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          consensus score / 100
        </p>
      </div>
    </div>
  );
}
