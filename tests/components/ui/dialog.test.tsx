import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "@/components/ui/dialog";

describe("Dialog", () => {
  it("renders children when open", () => {
    render(<Dialog open onClose={() => {}} title="T"><p>Content</p></Dialog>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
  it("calls onClose on Escape", () => {
    const onClose = vi.fn();
    render(<Dialog open onClose={onClose} title="T">x</Dialog>);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
  it("does not render when closed", () => {
    render(<Dialog open={false} onClose={() => {}} title="T"><p>Hidden</p></Dialog>);
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });
});
