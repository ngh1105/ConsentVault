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
  const reactId = React.useId();
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const focusIndex = (index: number) => {
    const target = tabRefs.current[index];
    if (!target) return;
    target.focus();
    onChange(tabs[index].id);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = tabs.length - 1;
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusIndex(index === lastIndex ? 0 : index + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusIndex(index === 0 ? lastIndex : index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusIndex(0);
        break;
      case "End":
        event.preventDefault();
        focusIndex(lastIndex);
        break;
      default:
        break;
    }
  };

  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === activeId));

  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-border">
        {tabs.map((tab, index) => {
          const selected = tab.id === activeId;
          const tabId = `${reactId}-tab-${tab.id}`;
          const panelId = `${reactId}-panel-${tab.id}`;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              id={tabId}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] transition-colors ${
                selected
                  ? "border-b-2 border-accent text-foreground"
                  : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${reactId}-panel-${tabs[activeIndex]?.id ?? activeId}`}
        aria-labelledby={`${reactId}-tab-${tabs[activeIndex]?.id ?? activeId}`}
        className="pt-6"
      >
        {children}
      </div>
    </div>
  );
}
