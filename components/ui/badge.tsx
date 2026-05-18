import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "neutral" | "accent" | "success" | "warning" | "danger";

const variantClasses: Record<Variant, string> = {
  neutral: "bg-card-elevated text-muted-foreground border-border",
  accent: "bg-accent/15 text-accent border-accent/30",
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-danger/15 text-danger border-danger/30",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs uppercase tracking-[0.18em]",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
