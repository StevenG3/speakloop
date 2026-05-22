import Link from "next/link";
import React from "react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Button, Card, Input } from "@/components/ui";
import { copy, type Locale } from "@/lib/i18n";
import { requestPasswordResetAction } from "./actions";

export function ForgotPasswordPageView({
  locale = "en-US",
  sent = false,
  error,
  resetLink
}: {
  locale?: Locale;
  sent?: boolean;
  error?: "try-again";
  resetLink?: string;
}) {
  const t = copy[locale].forgotPassword;

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
          <p className="mt-2 text-sm text-[var(--text-muted)]">{t.body}</p>
          {sent ? (
            <div className="mt-4 grid gap-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
              <p>{t.sent}</p>
              {resetLink ? (
                <Link href={resetLink} className="font-semibold text-green-800 underline underline-offset-2">
                  {t.stagingLink}
                </Link>
              ) : null}
            </div>
          ) : null}
          {error === "try-again" ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
              {t.tryAgain}
            </p>
          ) : null}
          <form action={requestPasswordResetAction} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              {t.email}
              <Input name="email" type="email" autoComplete="email" required />
            </label>
            <Button type="submit">{t.submit}</Button>
          </form>
          <p className="mt-5 text-center text-sm">
            <Link href="/login" className="font-semibold text-[var(--primary)]">
              {t.backToLogin}
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
