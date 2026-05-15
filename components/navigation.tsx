"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const routes = [
  { href: "/", label: "Dashboard" },
  { href: "/policy", label: "Policy" },
  { href: "/cases/new", label: "New Case" },
] as const;

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="border-ink/10 border-t px-4 py-4 sm:px-6 lg:px-8">
      <ul className="flex flex-wrap items-center gap-2">
        {routes.map((route) => {
          const isActive = route.href === "/" ? pathname === route.href : pathname.startsWith(route.href);

          return (
            <li key={route.href}>
              <Link
                href={route.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20",
                  isActive
                    ? "border-accent/20 bg-accent/8 text-foreground"
                    : "border-transparent text-muted-foreground hover:border-accent/20 hover:bg-accent/8 hover:text-foreground",
                )}
              >
                {route.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
