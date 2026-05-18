import * as React from "react";
import { Badge } from "./badge";
import { Skeleton } from "./skeleton";

interface Validator { id: string; name: string; lens: string; }
interface Judgment {
  verdict: string;
  confidence: number;
  reasoning: string;
  citedEvidenceIds: string[];
}

const verdictVariant: Record<string, "success" | "warning" | "danger"> = {
  Allowed: "success",
  "Needs Attribution": "warning",
  "Needs License": "warning",
  "Impersonation Risk": "danger",
  Violation: "danger",
};

export function ValidatorCard({
  validator, judgment, state,
}: {
  validator: Validator;
  judgment?: Judgment;
  state: "loading" | "ready";
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {validator.id}
      </p>
      <h4 className="mt-2 text-lg font-semibold text-foreground">{validator.name}</h4>
      <p className="mt-1 text-xs text-muted-foreground">{validator.lens}</p>
      <div className="mt-5">
        {state === "loading" || !judgment ? (
          <>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Badge variant={verdictVariant[judgment.verdict] ?? "neutral"}>
                {judgment.verdict}
              </Badge>
              <span className="font-mono text-sm text-foreground">
                {Math.round(judgment.confidence * 100)}%
              </span>
            </div>
            <p className="mt-3 text-sm text-foreground">{judgment.reasoning}</p>
            {judgment.citedEvidenceIds.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {judgment.citedEvidenceIds.map((id) => (
                  <Badge key={id} variant="neutral" className="!normal-case !tracking-normal">
                    {id}
                  </Badge>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
