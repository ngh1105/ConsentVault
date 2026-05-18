import * as React from "react";
import { AppTopBar } from "./app-top-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppTopBar />
      <main>{children}</main>
    </div>
  );
}
