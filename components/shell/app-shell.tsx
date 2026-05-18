import * as React from "react";
import { AppTopBar } from "./app-top-bar";
import { CommandPalette } from "./command-palette";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppTopBar />
      <CommandPalette />
      <main>{children}</main>
    </div>
  );
}
