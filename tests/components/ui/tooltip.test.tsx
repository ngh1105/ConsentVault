import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Tooltip } from "@/components/ui/tooltip";

describe("Tooltip", () => {
  it("dismisses on Escape until the trigger is focused again", () => {
    render(
      <Tooltip content="Helpful context">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: /Trigger/i });
    const tooltip = screen.getByRole("tooltip");

    expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);

    fireEvent.focus(trigger);
    expect(tooltip).toHaveClass("opacity-100");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(tooltip).toHaveClass("opacity-0");

    fireEvent.focus(trigger);
    expect(tooltip).toHaveClass("opacity-0");

    fireEvent.blur(trigger);
    fireEvent.focus(trigger);
    expect(tooltip).toHaveClass("opacity-100");
  });

  it("dismisses a hovered tooltip on Escape until the pointer re-enters", () => {
    render(
      <Tooltip content="Helpful context">
        <button type="button">Trigger</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: /Trigger/i });
    const wrapper = trigger.parentElement;
    const tooltip = screen.getByRole("tooltip");

    expect(wrapper).not.toBeNull();

    fireEvent.mouseEnter(wrapper as HTMLElement);
    expect(tooltip).toHaveClass("opacity-100");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(tooltip).toHaveClass("opacity-0");

    fireEvent.mouseEnter(wrapper as HTMLElement);
    expect(tooltip).toHaveClass("opacity-0");

    fireEvent.mouseLeave(wrapper as HTMLElement);
    fireEvent.mouseEnter(wrapper as HTMLElement);
    expect(tooltip).toHaveClass("opacity-100");
  });

  it("lets Escape continue to ancestor handlers after dismissing", () => {
    const onAncestorEscape = vi.fn();
    render(
      <div
        onKeyDown={(event) => {
          if (event.key === "Escape") onAncestorEscape();
        }}
      >
        <Tooltip content="Helpful context">
          <button type="button">Trigger</button>
        </Tooltip>
      </div>,
    );

    const trigger = screen.getByRole("button", { name: /Trigger/i });
    const tooltip = screen.getByRole("tooltip");

    fireEvent.focus(trigger);
    expect(tooltip).toHaveClass("opacity-100");

    fireEvent.keyDown(trigger, { key: "Escape" });

    expect(tooltip).toHaveClass("opacity-0");
    expect(onAncestorEscape).toHaveBeenCalledTimes(1);
  });
});
