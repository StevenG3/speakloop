import React from "react";
import { Button, Card, Input } from "@/components/ui";
import { onboardingAction } from "./actions";

const languages = [
  ["ko", "Korean"],
  ["en", "English"],
  ["zh", "Chinese"]
] as const;

const levels = [
  ["beginner", "Beginner"],
  ["intermediate", "Intermediate"],
  ["advanced", "Advanced"]
] as const;

export default function OnboardingPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--bg)] px-4 py-12 text-[var(--text)]">
      <Card className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold">Set your speaking loop</h1>
        <form action={onboardingAction} className="mt-6 grid gap-6">
          <fieldset className="grid gap-3">
            <legend className="text-sm font-semibold">Target language</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {languages.map(([value, label]) => (
                <label key={value} className="flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] px-3">
                  <input type="radio" name="targetLanguage" value={value} defaultChecked={value === "ko"} />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="grid gap-3">
            <legend className="text-sm font-semibold">Level</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {levels.map(([value, label]) => (
                <label key={value} className="flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] px-3">
                  <input type="radio" name="level" value={value} defaultChecked={value === "beginner"} />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="grid gap-2 text-sm font-medium">
            Goal
            <Input name="goal" defaultValue="Everyday conversation" required />
          </label>
          <Button type="submit">Continue</Button>
        </form>
      </Card>
    </main>
  );
}
