import { cva } from "class-variance-authority";
import type { CaseStatus } from "@/lib/domain";
import { cn } from "@/lib/utils";

const statusPillVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.24em]",
  {
    variants: {
      status: {
        Draft: "border-border bg-muted/70 text-muted-foreground",
        "In Review": "border-amber-700/15 bg-amber-600/10 text-amber-900",
        "Verdict Ready": "border-accent/20 bg-accent/10 text-accent",
      },
    },
    defaultVariants: {
      status: "Draft",
    },
  },
);

type StatusPillProps = {
  status: CaseStatus;
  className?: string;
};

export function StatusPill({ status, className }: StatusPillProps) {
  return <span className={cn(statusPillVariants({ status }), className)}>{status}</span>;
}
