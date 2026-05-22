import React from "react";
import { Button, Card, Slider } from "@/components/ui";
import { startPracticeAction } from "./actions";

export function PracticeSetup({ defaultSpeed }: { defaultSpeed: number }) {
  return (
    <main className="mx-auto grid max-w-3xl gap-6 p-4 text-[var(--text)]">
      <header>
        <h1 className="text-2xl font-bold">Practice</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Free-talk is enabled for the Phase-1 MVP.</p>
      </header>
      <form action={startPracticeAction} className="grid gap-6">
        <Card>
          <fieldset className="grid gap-3">
            <legend className="text-sm font-semibold">Mode</legend>
            <label className="flex min-h-11 items-center gap-2">
              <input type="radio" name="mode" value="free_talk" defaultChecked />
              Free talk
            </label>
            <label className="flex min-h-11 items-center gap-2 text-[var(--text-muted)]">
              <input type="radio" name="mode" value="scenario" disabled />
              Scenario Locked
            </label>
            <label className="flex min-h-11 items-center gap-2 text-[var(--text-muted)]">
              <input type="radio" name="mode" value="pronunciation" disabled />
              Pronunciation Locked
            </label>
          </fieldset>
        </Card>
        <Card>
          <label className="grid gap-3 text-sm font-semibold">
            Speed
            <Slider aria-label="Speed" name="speed" min={0.5} max={1.5} step={0.1} defaultValue={defaultSpeed} />
          </label>
        </Card>
        <Button type="submit">Start session</Button>
      </form>
    </main>
  );
}
