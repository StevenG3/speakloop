"use client";

import React from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button, Card, Slider } from "@/components/ui";
import { useSessionStore } from "@/lib/session-store";
import { MicPermissionGate, useMicrophone } from "@/lib/useMicrophone";
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
  const [currentMessages, setCurrentMessages] = useState(messages);
  const [vocabCandidates, setVocabCandidates] = useState<TurnVocabCandidate[]>([]);
  const [savedTerm, setSavedTerm] = useState<string | null>(null);
  const suppressNextClickRef = useRef(false);
  const microphone = useMicrophone();
  const currentStatus = useSessionStore((state) => state.status);
  const currentError = useSessionStore((state) => state.error);
  const speed = useSessionStore((state) => state.speed);
  const startRecording = useSessionStore((state) => state.startRecording);
  const stopRecording = useSessionStore((state) => state.stopRecording);
  const transcriptReady = useSessionStore((state) => state.transcriptReady);
  const replyReady = useSessionStore((state) => state.replyReady);
  const playbackEnded = useSessionStore((state) => state.playbackEnded);
  const fail = useSessionStore((state) => state.fail);
  const retry = useSessionStore((state) => state.retry);
  const setSpeed = useSessionStore((state) => state.setSpeed);
  const voiceCopy = voiceStateCopy[currentStatus] ?? fallbackVoiceCopy;

  useLayoutEffect(() => {
    useSessionStore.setState({ status, error, speed: 1 });
  }, [sessionId, status, error]);

  async function completeMockTurn(recording?: Blob | null) {
    beginTranscribingTurn();
    setCurrentMessages((existing) => [
      ...existing,
      { id: `pending-user-${Date.now()}`, role: "user", text: "Transcribing...", pending: true }
    ]);

    const response = await fetch("/api/turns", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        audio_fixture: "hello-ko.wav",
        speed,
        audio_blob: recording ? { type: recording.type, size: recording.size } : null
      })
    });

    if (!response.ok) {
      fail("Turn failed. Please retry.");
      return;
    }

    transcriptReady();
    const result = await response.json();
    replyReady();
    setVocabCandidates(result.vocab_candidates ?? []);
    setCurrentMessages((existing) => [
      ...existing.filter((message) => !message.pending),
      { id: `user-${Date.now()}`, role: "user", text: result.user_text },
      { id: `assistant-${Date.now()}`, role: "assistant", text: result.assistant_text, audioUrl: result.audio_url }
    ]);
    playbackEnded();
  }

  async function handlePushStart() {
    try {
      await microphone.start();
      startRecording();
    } catch {
      fail("Microphone permission is needed to record.");
    }
  }

  async function handlePushEnd() {
    if (currentStatus !== "recording") {
      return;
    }
    const recording = await microphone.stop();
    stopRecording();
    await completeMockTurn(recording);
    suppressNextClickRef.current = true;
  }

  function beginTranscribingTurn() {
    const state = useSessionStore.getState();
    if (state.status === "error") {
      retry();
      startRecording();
      stopRecording();
      return;
    }
    if (state.status === "idle") {
      startRecording();
      stopRecording();
    }
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
          <p className="text-sm text-[var(--text-muted)]">Live practice</p>
        </div>
        <StatusPill status={currentStatus} />
      </header>
      <section className="grid content-start gap-3">
        <section
          role="region"
          aria-label="Voice interaction"
          className={[
            "grid min-h-56 place-items-center rounded-2xl border p-6 text-center shadow-lg",
            currentStatus === "recording"
              ? "border-[var(--primary)] bg-[var(--surface-elevated)]"
              : "border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] backdrop-blur"
          ].join(" ")}
        >
          <div className="grid gap-3">
            <div className="mx-auto h-20 w-20 rounded-full bg-[var(--primary)] opacity-90 shadow-md" />
            <h2 className="text-2xl font-bold">{voiceCopy.title}</h2>
            <p className="text-sm text-[var(--text-muted)]">{voiceCopy.body}</p>
          </div>
        </section>
        <MicPermissionGate permission={microphone.permission} onRequest={() => void microphone.requestPermission()} />
        {currentError ? (
          <Card className="border-[var(--warning)]">
            <p>{currentError}</p>
            <Button className="mt-4" type="button" onClick={() => void completeMockTurn(microphone.blob)}>
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
            {message.audioUrl ? <AudioPlayer id={message.id} src={message.audioUrl} speed={speed} /> : null}
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
      <footer className="sticky bottom-0 grid gap-3 border-t border-[var(--border)] bg-[var(--bg)] pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <label className="grid gap-2 text-sm">
          Speed
          <Slider
            aria-label="Speed"
            min={0.5}
            max={1.5}
            step={0.1}
            value={speed}
            onChange={(event) => setSpeed(Number(event.currentTarget.value))}
          />
        </label>
        <Button
          type="button"
          disabled={microphone.permission !== "granted"}
          onPointerDown={() => void handlePushStart()}
          onPointerUp={() => void handlePushEnd()}
          onClick={() => {
            if (suppressNextClickRef.current) {
              suppressNextClickRef.current = false;
              return;
            }
            void completeMockTurn(microphone.blob);
          }}
        >
          {currentStatus === "recording" ? "Release to send" : "Push to talk"}
        </Button>
      </footer>
    </main>
  );
}

const voiceStateCopy: Record<string, { title: string; body: string }> = {
  idle: { title: "Ready when you are", body: "Hold the button and speak one short thought." },
  recording: { title: "Listening closely", body: "Release when your turn feels complete." },
  transcribing: { title: "Transcribing your voice", body: "Turning your recording into text." },
  thinking: { title: "Thinking with your tutor", body: "Preparing a warm reply and useful vocabulary." },
  speaking: { title: "Playing the reply", body: "Listen once, then try the phrase again." },
  error: { title: "Turn needs another try", body: "Your transcript is still here. Retry when ready." }
};

const fallbackVoiceCopy = { title: "Ready when you are", body: "Hold the button and speak one short thought." };

function AudioPlayer({ id, src, speed }: { id: string; src: string; speed: number }) {
  const ref = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.playbackRate = speed;
    }
  }, [speed]);

  return (
    <audio
      ref={ref}
      controls
      src={src}
      className="mt-3"
      data-testid={`audio-${id}`}
      data-playback-rate={String(speed)}
    />
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
