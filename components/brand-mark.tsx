import Link from "next/link";
import { Gavel, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  titleAs?: "h1" | "div" | "p";
};

export function BrandMark({ className, titleAs = "div" }: BrandMarkProps) {
  const Title = titleAs;

  return (
    <Link
      href="/"
      className={cn("inline-flex items-start gap-4 rounded-[1.5rem]", className)}
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] border border-accent/20 bg-accent/10 text-accent shadow-sm">
        <div className="relative flex h-8 w-8 items-center justify-center">
          <Gavel className="h-6 w-6" aria-hidden="true" />
          <ScrollText className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-card p-0.5 text-foreground" aria-hidden="true" />
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="eyebrow text-muted-foreground">Hybrid consent registry</p>
        <div className="flex flex-wrap items-center gap-3">
          <Title className="font-display text-4xl font-semibold tracking-[0.02em] text-foreground sm:text-5xl">
            ConsentVault
          </Title>
          <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-accent">
            archive beta
          </span>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Preserve creator consent terms, inspect suspicious AI outputs, and issue a shareable tribunal record.
        </p>
      </div>
    </Link>
  );
}
