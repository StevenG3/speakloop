import { sessionMachine, type SessionStatus } from "@speakloop/core";
import { createStore } from "zustand/vanilla";
import { create } from "zustand";

type SessionStoreState = {
  status: SessionStatus;
  error: string | undefined;
  speed: number;
  startRecording: () => void;
  stopRecording: () => void;
  transcriptReady: () => void;
  replyReady: () => void;
  playbackEnded: () => void;
  fail: (message: string) => void;
  retry: () => void;
  setSpeed: (speed: number) => void;
};

export function createSessionStore() {
  return createStore<SessionStoreState>((set, get) => ({
    status: "idle",
    error: undefined,
    speed: 1,
    startRecording: () => transition(set, get().status, { type: "START_RECORDING" }),
    stopRecording: () => transition(set, get().status, { type: "STOP_RECORDING" }),
    transcriptReady: () => transition(set, get().status, { type: "TRANSCRIPT_READY" }),
    replyReady: () => transition(set, get().status, { type: "REPLY_READY" }),
    playbackEnded: () => transition(set, get().status, { type: "PLAYBACK_ENDED" }),
    fail: (message) => transition(set, get().status, { type: "FAIL", message }),
    retry: () => transition(set, get().status, { type: "RETRY" }),
    setSpeed: (speed) => set({ speed })
  }));
}

export const useSessionStore = create<SessionStoreState>((set, get) => ({
  status: "idle",
  error: undefined,
  speed: 1,
  startRecording: () => transition(set, get().status, { type: "START_RECORDING" }),
  stopRecording: () => transition(set, get().status, { type: "STOP_RECORDING" }),
  transcriptReady: () => transition(set, get().status, { type: "TRANSCRIPT_READY" }),
  replyReady: () => transition(set, get().status, { type: "REPLY_READY" }),
  playbackEnded: () => transition(set, get().status, { type: "PLAYBACK_ENDED" }),
  fail: (message) => transition(set, get().status, { type: "FAIL", message }),
  retry: () => transition(set, get().status, { type: "RETRY" }),
  setSpeed: (speed) => set({ speed })
}));

function transition(
  set: (partial: Partial<SessionStoreState>) => void,
  status: SessionStatus,
  event: Parameters<typeof sessionMachine.transition>[1]
) {
  const next = sessionMachine.transition({ status: status === "error" ? "idle" : status }, event);
  if (next.status === "error") {
    set({ status: "error", error: next.message });
  } else {
    set({ status: next.status, error: undefined });
  }
}
