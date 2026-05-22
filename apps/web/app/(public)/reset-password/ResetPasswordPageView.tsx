import Link from "next/link";
import React from "react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Button, Card, Input } from "@/components/ui";
import { copy, type Locale } from "@/lib/i18n";
import { resetPasswordAction } from "./actions";

export function ResetPasswordPageView({
  locale = "en-US",
  token,
  error
}: {
  locale?: Locale;
  token: string;
  error?: "invalid";
}) {
  const t = copy[locale].resetPassword;

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
          {error === "invalid" ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
              {t.invalid}
            </p>
          ) : null}
          <form action={resetPasswordAction} className="mt-6 grid gap-4">
            <input type="hidden" name="token" value={token} />
            <div className="grid gap-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                {t.password}
              </label>
              <Input id="newPassword" name="password" type="password" autoComplete="new-password" required minLength={8} />
              <span className="text-xs text-[var(--text-muted)]">{t.passwordHelp}</span>
            </div>
            <Button type="submit">{t.submit}</Button>
          </form>
          <p className="mt-5 text-center text-sm">
            <Link href="/forgot-password" className="font-semibold text-[var(--primary)]">
              {t.backToForgot}
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
