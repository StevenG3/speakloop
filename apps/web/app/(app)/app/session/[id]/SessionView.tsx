"use client";

import React from "react";
import { useState } from "react";
import { Button, Card, Slider } from "@/components/ui";
import type { TurnVocabCandidate } from "@/lib/turn";

export type SessionMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  audioUrl?: string;
  pending?: boolean;
  error?: boolean;
};

export function SessionView({
  sessionId,
  status,
  messages,
  error,
  targetLanguage = "ko"
}: {
  sessionId: string;
  status: "idle" | "recording" | "transcribing" | "thinking" | "speaking" | "error";
  messages: SessionMessage[];
  error?: string;
  targetLanguage?: "ko" | "en" | "zh";
}) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [currentMessages, setCurrentMessages] = useState(messages);
  const [currentError, setCurrentError] = useState(error);
  const [vocabCandidates, setVocabCandidates] = useState<TurnVocabCandidate[]>([]);
  const [savedTerm, setSavedTerm] = useState<string | null>(null);

  async function completeMockTurn() {
    setCurrentError(undefined);
    setCurrentStatus("transcribing");
    setCurrentMessages((existing) => [
      ...existing,
      { id: `pending-user-${Date.now()}`, role: "user", text: "Transcribing...", pending: true }
    ]);

    const response = await fetch("/api/turns", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, audio_fixture: "hello-ko.wav" })
    });

    if (!response.ok) {
      setCurrentStatus("error");
      setCurrentError("Turn failed. Please retry.");
      return;
    }

    setCurrentStatus("thinking");
    const result = await response.json();
    setVocabCandidates(result.vocab_candidates ?? []);
    setCurrentMessages((existing) => [
      ...existing.filter((message) => !message.pending),
      { id: `user-${Date.now()}`, role: "user", text: result.user_text },
      { id: `assistant-${Date.now()}`, role: "assistant", text: result.assistant_text, audioUrl: result.audio_url }
    ]);
    setCurrentStatus("idle");
  }

  async function saveCandidate(candidate: TurnVocabCandidate) {
    await fetch("/api/vocab", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        language: targetLanguage,
        term: candidate.term,
        reading: candidate.reading,
        meaning: candidate.meaning,
        examples: candidate.example ? [{ sentence: candidate.example }] : []
      })
    });
    setSavedTerm(candidate.term);
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-3xl grid-rows-[auto_1fr_auto] gap-4 p-4 text-[var(--text)]">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Conversation</h1>
          <p className="text-sm text-[var(--text-muted)]">Session {sessionId}</p>
        </div>
        <StatusPill status={currentStatus} />
      </header>
      <section className="grid content-start gap-3">
        {currentError ? (
          <Card className="border-[var(--warning)]">
            <p>{currentError}</p>
            <Button className="mt-4" type="button">
              Retry turn
            </Button>
          </Card>
        ) : null}
        {currentMessages.map((message) => (
          <article
            key={message.id}
            className={[
              "rounded-lg border border-[var(--border)] p-4",
              message.role === "user" ? "justify-self-end bg-[var(--surface-elevated)]" : "justify-self-start bg-[var(--surface)]",
              message.pending ? "animate-pulse" : "",
              message.error ? "border-[var(--danger)]" : ""
            ].join(" ")}
          >
            <p>{message.text}</p>
            {message.audioUrl ? <audio controls src={message.audioUrl} className="mt-3" /> : null}
          </article>
        ))}
        {vocabCandidates.length > 0 ? (
          <Card className="grid gap-3">
            <h2 className="font-semibold">Save vocabulary</h2>
            {vocabCandidates.map((candidate) => (
              <div key={candidate.term} className="flex items-center justify-between gap-3">
                <span>{candidate.term}</span>
                <Button type="button" variant="secondary" onClick={() => void saveCandidate(candidate)}>
                  Save {candidate.term}
                </Button>
              </div>
            ))}
            {savedTerm ? <p className="text-sm text-[var(--success)]">Saved {savedTerm}</p> : null}
          </Card>
        ) : null}
      </section>
      <footer className="sticky bottom-0 grid gap-3 border-t border-[var(--border)] bg-[var(--bg)] py-3">
        <label className="grid gap-2 text-sm">
          Speed
          <Slider aria-label="Speed" min={0.5} max={1.5} step={0.1} defaultValue={1} />
        </label>
        <Button type="button" onClick={() => void completeMockTurn()}>
          {currentStatus === "recording" ? "Release to send" : "Push to talk"}
        </Button>
      </footer>
    </main>
  );
}

function StatusPill({ status }: { status: string }) {
  const label = {
    idle: "Idle",
    recording: "Recording",
    transcribing: "Transcribing...",
    thinking: "Thinking...",
    speaking: "Speaking",
    error: "Error"
  }[status];

  return <span className="rounded-full bg-[var(--surface-elevated)] px-3 py-1 text-sm font-semibold">{label}</span>;
}
