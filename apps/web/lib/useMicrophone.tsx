"use client";

import React, { useRef, useState } from "react";
import { Button, Card } from "@/components/ui";

export type MicrophonePermission = "idle" | "prompting" | "granted" | "denied" | "unsupported";

export function useMicrophone() {
  const [permission, setPermission] = useState<MicrophonePermission>("idle");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const startedAtRef = useRef(0);
  const chunksRef = useRef<Blob[]>([]);

  async function ensureStream() {
    if (streamRef.current) {
      return streamRef.current;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setPermission("unsupported");
      throw new Error("Microphone recording is not supported in this browser");
    }

    setPermission("prompting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermission("granted");
      return stream;
    } catch (error) {
      setPermission("denied");
      throw error;
    }
  }

  async function requestPermission() {
    await ensureStream();
  }

  async function start() {
    const stream = await ensureStream();
    chunksRef.current = [];
    setBlob(null);
    setDurationMs(0);

    const mimeType = preferredAudioMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;
    startedAtRef.current = Date.now();
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    recorder.start();
  }

  async function stop() {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      return blob;
    }

    return new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const nextBlob = new Blob(chunksRef.current, { type: recorder.mimeType || preferredAudioMimeType() || "audio/webm" });
        setBlob(nextBlob);
        setDurationMs(Math.max(1, Date.now() - startedAtRef.current));
        resolve(nextBlob);
      };
      recorder.stop();
    });
  }

  return { requestPermission, start, stop, blob, durationMs, permission };
}

export function MicPermissionGate({
  permission,
  onRequest
}: {
  permission: MicrophonePermission;
  onRequest: () => void | Promise<void>;
}) {
  if (permission === "granted") {
    return null;
  }

  if (permission === "denied") {
    return (
      <Card className="grid gap-3 border-[var(--warning)]">
        <h2 className="font-semibold">Microphone access is blocked</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Open your browser settings, allow microphone access for SpeakLoop, then try again.
        </p>
        <Button type="button" variant="secondary" onClick={() => void onRequest()}>
          Try again
        </Button>
      </Card>
    );
  }

  if (permission === "unsupported") {
    return (
      <Card className="grid gap-3 border-[var(--warning)]">
        <h2 className="font-semibold">Recording is not supported</h2>
        <p className="text-sm text-[var(--text-muted)]">Use a browser with MediaRecorder support to practice speaking.</p>
      </Card>
    );
  }

  return (
    <Card className="grid gap-3">
      <h2 className="font-semibold">Enable microphone</h2>
      <p className="text-sm text-[var(--text-muted)]">
        SpeakLoop only asks when you choose to record. Your audio is used for this practice turn.
      </p>
      <Button type="button" onClick={() => void onRequest()}>
        Enable microphone
      </Button>
    </Card>
  );
}

function preferredAudioMimeType() {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/wav"];
  return candidates.find((candidate) => MediaRecorder.isTypeSupported?.(candidate)) ?? "";
}
