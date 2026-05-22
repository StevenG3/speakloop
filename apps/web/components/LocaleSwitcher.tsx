import React from "react";
import { setLocaleAction } from "@/app/locale-actions";
import { locales, type Locale } from "@/lib/i18n";

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  return (
    <form action={setLocaleAction} className="flex items-center gap-2">
      {locales.map((option) => (
        <button
          key={option}
          name="locale"
          value={option}
          type="submit"
          aria-pressed={locale === option}
          className={[
            "min-h-9 rounded-md border border-[var(--border)] px-3 text-sm font-semibold",
            locale === option ? "bg-[var(--primary)] text-[var(--primary-fg)]" : "bg-[var(--surface)] text-[var(--text)]"
          ].join(" ")}
        >
          {option === "zh-CN" ? "中文" : "English"}
        </button>
      ))}
    </form>
  );
}
