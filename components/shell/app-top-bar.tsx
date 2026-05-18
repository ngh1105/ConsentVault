import * as React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/cases/new", label: "New case" },
  { href: "/policy", label: "Policy" },
];

export function AppTopBar() {
  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-6 px-6 md:px-10">
        <Link
          href="/"
          className="font-mono text-sm font-semibold uppercase tracking-[0.22em] text-foreground"
        >
          ConsentVault
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
