"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";

const actions = [
  { id: "dash", label: "Open dashboard", path: "/" },
  { id: "new-case", label: "New case", path: "/cases/new" },
  { id: "policy", label: "Edit policy", path: "/policy" },
];
const listboxId = "command-palette-listbox";
const optionId = (id: string) => `command-palette-option-${id}`;

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const router = useRouter();

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target?.matches?.('input, textarea, [contenteditable="true"]')) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()),
  );
  const boundedActiveIndex =
    filtered.length === 0 ? 0 : Math.min(activeIndex, filtered.length - 1);
  const activeAction = filtered[boundedActiveIndex];

  React.useEffect(() => {
    setActiveIndex(0);
  }, [open, query]);

  function handleClose() {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }

  function selectAction(action: (typeof actions)[number]) {
    router.push(action.path);
    handleClose();
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => {
        if (filtered.length === 0) return 0;
        return (index + 1) % filtered.length;
      });
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => {
        if (filtered.length === 0) return 0;
        return (index - 1 + filtered.length) % filtered.length;
      });
    }

    if (event.key === "Enter" && activeAction) {
      event.preventDefault();
      selectAction(activeAction);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Command palette">
      <input
        autoFocus
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={activeAction ? optionId(activeAction.id) : undefined}
        placeholder="Type a command..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleInputKeyDown}
        className="w-full rounded-md border border-border bg-card-elevated px-3 py-2 text-foreground outline-none focus:border-accent"
      />
      <ul id={listboxId} role="listbox" className="mt-4 flex flex-col gap-1">
        {filtered.map((action) => (
          <li key={action.id}>
            <button
              id={optionId(action.id)}
              type="button"
              role="option"
              aria-selected={activeAction?.id === action.id}
              onMouseEnter={() => setActiveIndex(filtered.findIndex((item) => item.id === action.id))}
              onClick={() => selectAction(action)}
              className="w-full rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-card-elevated"
            >
              {action.label}
            </button>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}
