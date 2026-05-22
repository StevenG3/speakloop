import Link from "next/link";
import React from "react";
import { Card, EmptyState } from "@/components/ui";

export type HistorySession = {
  id: string;
  title: string;
  startedAt: string;
  messages: string[];
};

export function HistoryList({ sessions }: { sessions: HistorySession[] }) {
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-bold">Conversation history</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Replay previous free-talk sessions and review the transcript.</p>
      </header>
      {sessions.length === 0 ? (
        <EmptyState title="No conversations yet" />
      ) : (
        <div className="grid gap-3">
          {sessions.map((session) => (
            <Card key={session.id}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Link href={`/app/session/${session.id}`} className="font-semibold">
                    Replay {session.title}
                  </Link>
                  <p className="text-sm text-[var(--text-muted)]">{session.startedAt}</p>
                </div>
              </div>
              <ul className="mt-3 grid gap-2 text-sm">
                {session.messages.map((message, index) => (
                  <li key={`${session.id}-${index}`} className="rounded-md bg-[var(--surface-elevated)] px-3 py-2">
                    {message}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
