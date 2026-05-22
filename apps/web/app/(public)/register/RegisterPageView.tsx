import React from "react";
import Link from "next/link";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Button, Card, Input } from "@/components/ui";
import { copy, languageLabels, languages, type Locale } from "@/lib/i18n";
import { registerAction } from "./actions";

type RegisterError = "email-registered";

export function RegisterPageView({ locale = "en-US", error }: { locale?: Locale; error?: RegisterError }) {
  const t = copy[locale].register;
  const labels = {
    ...languageLabels[locale],
    ...(locale === "zh-CN" ? { zh: "汉语" } : {})
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] px-4 py-10 text-[var(--text)]">
      <div className="grid w-full max-w-md gap-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-[var(--text)]">
            SpeakLoop
          </Link>
          <LocaleSwitcher locale={locale} />
        </div>
        <Card>
          <h1 className="text-2xl font-bold">{t.title}</h1>
          {error === "email-registered" ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
              {t.duplicateEmail}
            </p>
          ) : null}
          <form action={registerAction} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              {t.displayName}
              <Input name="displayName" required />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              {t.email}
              <Input name="email" type="email" autoComplete="email" required />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              {t.password}
              <Input name="password" type="password" autoComplete="new-password" required minLength={8} />
              <span className="text-xs text-[var(--text-muted)]">{t.passwordHelp}</span>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              {t.nativeLanguage}
              <select
                name="nativeLanguage"
                defaultValue={locale === "zh-CN" ? "zh" : "en"}
                className="min-h-11 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-base text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              >
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {labels[language]}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit">{t.submit}</Button>
          </form>
          <p className="mt-5 text-center text-sm text-[var(--text-muted)]">
            {t.existingAccount}{" "}
            <Link href="/login" className="font-semibold text-[var(--primary)]">
              {t.signIn}
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
