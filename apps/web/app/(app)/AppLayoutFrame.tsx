import type { ReactNode } from "react";
import React from "react";
import Link from "next/link";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { AppShell } from "@/components/ui";
import { copy, type Locale } from "@/lib/i18n";

const navItems = [
  { href: "/app", key: "dashboard" },
  { href: "/app/practice", key: "practice" },
  { href: "/app/vocab", key: "vocab" },
  { href: "/app/review", key: "review" },
  { href: "/app/settings", key: "settings" }
] as const;

export function AppLayoutFrame({ children, locale = "en-US" }: { children: ReactNode; locale?: Locale }) {
  const t = copy[locale];

  return (
    <AppShell
      nav={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto" role="navigation" aria-label={t.navLabel}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="min-h-11 whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text)]"
              >
                {t.nav[item.key]}
              </Link>
            ))}
          </div>
          <LocaleSwitcher locale={locale} />
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
