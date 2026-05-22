import React from "react";
import Link from "next/link";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Button, Card, Input } from "@/components/ui";
import { copy, type Locale } from "@/lib/i18n";
import { loginAction } from "./actions";

export function LoginForm({ redirectTo, locale = "en-US" }: { redirectTo: string; locale?: Locale }) {
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
