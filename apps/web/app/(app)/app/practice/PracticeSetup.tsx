import React from "react";
import { Button, Card, Slider } from "@/components/ui";
import { copy, languageLabels, languages, type AppLanguage, type Locale } from "@/lib/i18n";
import { startPracticeAction } from "./actions";

export function PracticeSetup({
  defaultSpeed,
  targetLanguage = "ko",
  locale = "en-US"
}: {
  defaultSpeed: number;
  targetLanguage?: AppLanguage;
  locale?: Locale;
}) {
  const t = copy[locale].practice;
  const labels = languageLabels[locale];

  return (
    <main className="mx-auto grid max-w-3xl gap-6 p-4 text-[var(--text)]">
      <header>
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{t.body}</p>
      </header>
      <form action={startPracticeAction} className="grid gap-6">
        <Card>
          <fieldset className="grid gap-3">
            <legend className="text-sm font-semibold">{t.targetLanguage}</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {languages.map((language) => (
                <label key={language} className="flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] px-3">
                  <input type="radio" name="targetLanguage" value={language} defaultChecked={language === targetLanguage} />
                  {labels[language]}
                </label>
              ))}
            </div>
          </fieldset>
        </Card>
        <Card>
          <fieldset className="grid gap-3">
            <legend className="text-sm font-semibold">{t.mode}</legend>
            <label className="flex min-h-11 items-center gap-2">
              <input type="radio" name="mode" value="free_talk" defaultChecked />
              {t.freeTalk}
            </label>
            <label className="flex min-h-11 items-center gap-2 text-[var(--text-muted)]">
              <input type="radio" name="mode" value="scenario" disabled />
              {t.scenarioLocked}
            </label>
            <label className="flex min-h-11 items-center gap-2 text-[var(--text-muted)]">
              <input type="radio" name="mode" value="pronunciation" disabled />
              {t.pronunciationLocked}
            </label>
          </fieldset>
        </Card>
        <Card>
          <label className="grid gap-3 text-sm font-semibold">
            {t.speed}
            <Slider aria-label={t.speed} name="speed" min={0.5} max={1.5} step={0.1} defaultValue={defaultSpeed} />
          </label>
        </Card>
        <Button type="submit">{t.submit}</Button>
      </form>
    </main>
  );
}
