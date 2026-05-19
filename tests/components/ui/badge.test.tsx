import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders text", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies variant class", () => {
    render(<Badge variant="success">Allowed</Badge>);
    expect(screen.getByText("Allowed").className).toMatch(/success/);
  });
});
