import type { ReactNode } from "react";
import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui";

const navItems = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/practice", label: "Practice" },
  { href: "/app/vocab", label: "Vocab" },
  { href: "/app/review", label: "Review" },
  { href: "/app/settings", label: "Settings" }
];

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell
      nav={
        <div className="flex items-center gap-2 overflow-x-auto" role="navigation" aria-label="App navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="min-h-11 whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text)]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
