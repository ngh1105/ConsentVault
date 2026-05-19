"use client";

import * as React from "react";

export function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  const tooltipId = React.useId();
  const child = React.Children.only(children) as React.ReactElement<{
    "aria-describedby"?: string;
  }>;
  const existingDescribedBy = child.props["aria-describedby"];
  const describedBy = existingDescribedBy
    ? `${existingDescribedBy} ${tooltipId}`
    : tooltipId;

  return (
    <span className="group relative inline-flex">
      {React.cloneElement(child, { "aria-describedby": describedBy })}
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card-elevated px-2 py-1 font-mono text-xs text-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}
