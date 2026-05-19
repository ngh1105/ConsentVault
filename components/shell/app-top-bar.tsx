"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/cases/new", label: "New case" },
  { href: "/policy", label: "Policy" },
];

export function AppTopBar() {
  const mobileNavRef = React.useRef<HTMLDetailsElement>(null);
  const closeMobileNav = () => {
    mobileNavRef.current?.removeAttribute("open");
  };

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-6 px-6 md:px-10">
        <Link
          href="/"
          className="font-mono text-sm font-semibold uppercase tracking-[0.22em] text-foreground"
        >
          ConsentVault
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
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
          <details ref={mobileNavRef} className="relative md:hidden">
            <summary
              aria-label="Open navigation"
              className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-card-elevated [&::-webkit-details-marker]:hidden"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </summary>
            <nav
              aria-label="Mobile"
              className="absolute right-0 top-12 z-50 flex w-48 flex-col gap-1 rounded-2xl border border-border bg-card p-2 shadow-lg"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileNav}
                  className="rounded-md px-3 py-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:bg-card-elevated hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
