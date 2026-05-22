import Link from "next/link";
import React from "react";
import { Button, Card, EmptyState, Skeleton } from "@/components/ui";

export type RecentSession = {
  id: string;
  title: string;
  startedAt: string;
};

export function Dashboard({
  displayName,
  dueCount,
  streakDays,
  recentSessions,
  loading = false
}: {
  displayName: string;
  dueCount: number;
  streakDays: number;
  recentSessions: RecentSession[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-4">
        <Skeleton aria-label="Loading dashboard" />
        <Skeleton />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {displayName}</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Keep the loop warm with one short conversation.</p>
        </div>
        <Button asChild>
          <Link href="/app/practice">Start practice</Link>
        </Button>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-[var(--text-muted)]">Review due</h2>
          <p className="mt-3 text-3xl font-bold">{dueCount} due</p>
          <Button asChild variant="secondary" className="mt-4">
            <Link href="/app/review">Review now</Link>
          </Button>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-[var(--text-muted)]">Streak</h2>
          <p className="mt-3 text-3xl font-bold">{streakDays} day streak</p>
        </Card>
      </section>
      <Card>
        <h2 className="text-lg font-semibold">Recent sessions</h2>
        {recentSessions.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="Start your first conversation" action={<Button asChild><Link href="/app/practice">Start practice</Link></Button>} />
          </div>
        ) : (
          <ul className="mt-4 grid gap-3">
            {recentSessions.map((session) => (
              <li key={session.id} className="rounded-md border border-[var(--border)] p-3">
                <Link href={`/app/session/${session.id}`} className="font-medium">
                  {session.title}
                </Link>
                <p className="text-sm text-[var(--text-muted)]">{session.startedAt}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
