"use client";

import * as React from "react";

type TooltipChildProps = React.HTMLAttributes<HTMLElement> & {
  "aria-describedby"?: string;
};

export function Tooltip({
  content,
  children,
}: {
  content: string;
  children: React.ReactElement<TooltipChildProps>;
}) {
  const tooltipId = React.useId();
  const [visible, setVisible] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const child = React.Children.only(children);
  const existingDescribedBy = child.props["aria-describedby"];
  const describedBy = existingDescribedBy
    ? `${existingDescribedBy} ${tooltipId}`
    : tooltipId;
  const showTooltip = () => {
    if (!dismissed) setVisible(true);
  };
  const resetTooltip = () => {
    setVisible(false);
    setDismissed(false);
  };

  React.useEffect(() => {
    if (!visible) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setVisible(false);
      setDismissed(true);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible]);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={resetTooltip}
      onFocus={showTooltip}
      onBlur={resetTooltip}
    >
      {React.cloneElement(child, {
        "aria-describedby": describedBy,
      })}
      <span
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-card-elevated px-2 py-1 font-mono text-xs text-foreground shadow-lg transition-opacity duration-150 ${visible ? "opacity-100" : "opacity-0"}`}
      >
        {content}
      </span>
    </span>
  );
}
