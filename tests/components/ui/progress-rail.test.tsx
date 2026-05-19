import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressRail } from "@/components/ui/progress-rail";

describe("ProgressRail", () => {
  const steps = [
    { id: "setup", label: "Setup", href: "/cases/x", state: "done" as const },
    { id: "evidence", label: "Evidence", href: "/cases/x/evidence", state: "current" as const },
    { id: "trial", label: "Trial", href: "/cases/x/trial", state: "locked" as const },
    { id: "receipt", label: "Receipt", href: "/cases/x/receipt", state: "locked" as const },
  ];

  it("renders all step labels", () => {
    render(<ProgressRail steps={steps} />);
    for (const step of steps) {
      expect(screen.getByText(step.label)).toBeInTheDocument();
    }
  });

  it("locked step is not a link", () => {
    render(<ProgressRail steps={steps} />);
    expect(screen.getByText("Trial").closest("a")).toBeNull();
  });

  it("done step is a link", () => {
    render(<ProgressRail steps={steps} />);
    expect(screen.getByText("Setup").closest("a")).not.toBeNull();
  });
});
