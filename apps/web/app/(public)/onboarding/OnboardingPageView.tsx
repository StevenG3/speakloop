import React from "react";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Button, Card, Input } from "@/components/ui";
import { copy, languageLabels, languages, levelLabels, type Locale } from "@/lib/i18n";
import { onboardingAction } from "./actions";

const levels = ["beginner", "intermediate", "advanced"] as const;

export function OnboardingPageView({ locale = "en-US" }: { locale?: Locale }) {
  const t = copy[locale].onboarding;
  const labels = languageLabels[locale];
  const levelsByLocale = levelLabels[locale];

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] px-4 py-12 text-[var(--text)]">
      <div className="grid w-full max-w-2xl gap-4">
        <div className="justify-self-end">
          <LocaleSwitcher locale={locale} />
        </div>
        <Card>
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <form action={onboardingAction} className="mt-6 grid gap-6">
            <fieldset className="grid gap-3">
              <legend className="text-sm font-semibold">{t.targetLanguage}</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {languages.map((value) => (
                  <label key={value} className="flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] px-3">
                    <input type="radio" name="targetLanguage" value={value} defaultChecked={value === "ko"} />
                    {labels[value]}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="grid gap-3">
              <legend className="text-sm font-semibold">{t.level}</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {levels.map((value) => (
                  <label key={value} className="flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] px-3">
                    <input type="radio" name="level" value={value} defaultChecked={value === "beginner"} />
                    {levelsByLocale[value]}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="grid gap-2 text-sm font-medium">
              {t.goal}
              <Input name="goal" defaultValue={t.defaultGoal} required />
            </label>
            <Button type="submit">{t.submit}</Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
