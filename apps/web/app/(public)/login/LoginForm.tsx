import React from "react";
import Link from "next/link";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Button, Card, Input } from "@/components/ui";
import { copy, type Locale } from "@/lib/i18n";
import { loginAction } from "./actions";

type LoginError = "invalid-credentials";
type ResetState = "success";

export function LoginForm({
  redirectTo,
  locale = "en-US",
  error,
  reset
}: {
  redirectTo: string;
  locale?: Locale;
  error?: LoginError;
  reset?: ResetState;
}) {
  const t = copy[locale].login;

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
          {error === "invalid-credentials" ? (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
              {t.invalidCredentials}
            </p>
          ) : null}
          {reset === "success" ? (
            <p className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700" role="status">
              {t.resetSuccess}
            </p>
          ) : null}
          <form action={loginAction} className="mt-6 grid gap-4">
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <label className="grid gap-2 text-sm font-medium">
              {t.email}
              <Input name="email" type="email" autoComplete="email" required />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              {t.password}
              <Input name="password" type="password" autoComplete="current-password" required />
            </label>
            <Button type="submit">{t.submit}</Button>
          </form>
          <p className="mt-4 text-center text-sm">
            <Link href="/forgot-password" className="font-semibold text-[var(--primary)]">
              {t.forgotPassword}
            </Link>
          </p>
          <p className="mt-5 text-center text-sm text-[var(--text-muted)]">
            {t.newAccount}{" "}
            <Link href="/register" className="font-semibold text-[var(--primary)]">
              {t.createAccount}
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
