"use client";

import React, { useState } from "react";
import { Badge, Button, Card, EmptyState, Skeleton } from "@/components/ui";

export type ReviewQueueCard = {
  id: string;
  term: string;
  meaning: string;
  language: "ko" | "en" | "zh";
  progressLabel: string;
};

export function ReviewQueue({ cards, loading = false, error }: { cards: ReviewQueueCard[]; loading?: boolean; error?: string }) {
  const [revealed, setRevealed] = useState(false);
  const [graded, setGraded] = useState<string | null>(null);
  const card = cards[0];

  if (loading) {
    return (
      <main className="mx-auto grid max-w-3xl gap-6 p-4 text-[var(--text)]" aria-label="Loading review queue">
        <Skeleton />
        <Skeleton />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto grid max-w-3xl gap-6 p-4 text-[var(--text)]">
        <Card className="border-[var(--danger)]">
          <h1 className="text-xl font-semibold">Review needs a refresh</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{error}</p>
        </Card>
      </main>
    );
  }

  if (!card) {
    return (
      <main className="mx-auto grid max-w-3xl gap-6 p-4 text-[var(--text)]">
        <h1 className="text-2xl font-bold">Review</h1>
        <EmptyState title="All caught up" />
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-3xl gap-6 p-4 text-[var(--text)]">
      <header className="grid gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Review</h1>
          <Badge>{card.progressLabel}</Badge>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-elevated)]">
          <div className="h-full w-1/2 bg-[var(--primary)]" />
        </div>
      </header>
      <Card className="grid min-h-64 place-items-center gap-6 text-center">
        <div>
          <p className="text-sm uppercase text-[var(--text-muted)]">{card.language}</p>
          <h2 className="mt-2 text-3xl font-bold">{card.term}</h2>
          {revealed ? <p className="mt-4 text-lg">{card.meaning}</p> : null}
        </div>
        {revealed ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {["Again", "Hard", "Good", "Easy"].map((grade) => (
              <Button
                key={grade}
                type="button"
                variant={grade === "Again" ? "destructive" : "secondary"}
                onClick={() => void gradeCard(card.id, grade.toLowerCase(), setGraded)}
              >
                {grade}
              </Button>
            ))}
          </div>
        ) : (
          <Button type="button" onClick={() => setRevealed(true)}>
            Reveal answer
          </Button>
        )}
        {graded ? <p className="text-sm text-[var(--success)]">Graded {graded}</p> : null}
      </Card>
    </main>
  );
}

async function gradeCard(cardId: string, grade: string, onDone: (grade: string) => void) {
  await fetch("/api/review/grade", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ card_id: cardId, grade })
  });
  onDone(grade);
}
