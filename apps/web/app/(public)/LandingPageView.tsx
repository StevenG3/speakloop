import Link from "next/link";
import React from "react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Button, Card } from "@/components/ui";
import { copy, type Locale } from "@/lib/i18n";

export function LandingPageView({ locale = "en-US" }: { locale?: Locale }) {
  const t = copy[locale];

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-16 text-[var(--text)]">
      <section className="mx-auto grid max-w-5xl gap-8">
        <div className="flex justify-end">
          <LocaleSwitcher locale={locale} />
        </div>
        <div className="grid gap-6 text-center">
          <p className="text-sm font-semibold text-[var(--primary)]">{t.landing.eyebrow}</p>
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">SpeakLoop</h1>
          <p className="mx-auto max-w-2xl text-base text-[var(--text-muted)] md:text-lg">{t.landing.body}</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/login">{t.landing.cta}</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/register">{t.landing.secondaryCta}</Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {t.landing.cards.map((title) => (
            <Card key={title}>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{t.landing.cardBody}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
