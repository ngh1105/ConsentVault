import * as React from "react";
import Link from "next/link";
import { Check } from "lucide-react";

export interface ProgressStep {
  id: string;
  label: string;
  href: string;
  state: "done" | "current" | "locked";
}

export function ProgressRail({ steps }: { steps: ProgressStep[] }) {
  return (
    <nav
      aria-label="Case progress"
      className="sticky top-14 z-30 h-12 border-b border-border bg-background/80 backdrop-blur-md"
    >
      <ol className="mx-auto flex h-full max-w-[1280px] items-center gap-6 overflow-x-auto px-6 md:px-10">
        {steps.map((step) => (
          <li key={step.id} className="flex flex-shrink-0 items-center gap-2">
            {step.state === "locked" ? (
              <span aria-disabled="true" className="flex items-center gap-2 text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                <span className="font-mono text-xs uppercase tracking-[0.18em]">{step.label}</span>
              </span>
            ) : (
              <Link
                href={step.href}
                className={`flex items-center gap-2 transition-colors ${
                  step.state === "current" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {step.state === "done" ? (
                  <Check className="h-3 w-3 text-accent" aria-hidden="true" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-accent ring-4 ring-accent/16" />
                )}
                <span
                  className={`font-mono text-xs uppercase tracking-[0.18em] ${
                    step.state === "current"
                      ? "underline decoration-accent decoration-2 underline-offset-4"
                      : ""
                  }`}
                >
                  {step.label}
                </span>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
