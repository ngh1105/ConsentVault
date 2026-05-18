"use client";

import * as React from "react";

interface Tab { id: string; label: string; }

export function Tabs({
  tabs, activeId, onChange, children,
}: {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === activeId}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] transition-colors ${
              tab.id === activeId
                ? "border-b-2 border-accent text-foreground"
                : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-6">{children}</div>
    </div>
  );
}
