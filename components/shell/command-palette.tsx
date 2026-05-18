"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";

const actions = [
  { id: "dash", label: "Open dashboard", path: "/" },
  { id: "new-case", label: "New case", path: "/cases/new" },
  { id: "policy", label: "Edit policy", path: "/policy" },
];

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
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

  function handleClose() {
    setOpen(false);
    setQuery("");
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Command palette">
      <input
        autoFocus
        type="text"
        placeholder="Type a command..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-md border border-border bg-card-elevated px-3 py-2 text-foreground outline-none focus:border-accent"
      />
      <ul className="mt-4 flex flex-col gap-1">
        {filtered.map((action) => (
          <li key={action.id}>
            <button
              type="button"
              onClick={() => {
                router.push(action.path);
                handleClose();
              }}
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
