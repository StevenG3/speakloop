import Link from "next/link";
import React from "react";
import { Button, Card } from "@/components/ui";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-16 text-[var(--text)]">
      <section className="mx-auto grid max-w-5xl gap-8">
        <div className="grid gap-6 text-center">
          <p className="text-sm font-semibold text-[var(--primary)]">AI speaking practice</p>
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">SpeakLoop</h1>
          <p className="mx-auto max-w-2xl text-base text-[var(--text-muted)] md:text-lg">
            Talk, get gentle corrections, save the words that slowed you down, and review them on a spaced schedule.
          </p>
          <div>
            <Button asChild>
              <Link href="/register">Start speaking</Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {["Low-pressure conversation", "Personal vocabulary", "Spaced review"].map((title) => (
            <Card key={title}>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Free-talk mode keeps Phase 1 focused on the speaking loop.
              </p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
