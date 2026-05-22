export type SessionStatus = "idle" | "recording" | "transcribing" | "thinking" | "speaking" | "error";

export type SessionState =
  | { status: Exclude<SessionStatus, "error"> }
  | { status: "error"; message: string; previous: Exclude<SessionStatus, "error"> };

export type SessionEvent =
  | { type: "START_RECORDING" }
  | { type: "STOP_RECORDING" }
  | { type: "TRANSCRIPT_READY" }
  | { type: "REPLY_READY" }
  | { type: "PLAYBACK_ENDED" }
  | { type: "FAIL"; message: string }
  | { type: "RETRY" };

export const sessionMachine = {
  transition(state: SessionState, event: SessionEvent): SessionState {
    if (event.type === "FAIL") {
      return {
        status: "error",
        message: event.message,
        previous: state.status === "error" ? state.previous : state.status
      };
    }

    if (state.status === "error") {
      return event.type === "RETRY" ? { status: "idle" } : state;
    }

    const transitions: Record<string, SessionStatus> = {
      "idle:START_RECORDING": "recording",
      "recording:STOP_RECORDING": "transcribing",
      "transcribing:TRANSCRIPT_READY": "thinking",
      "thinking:REPLY_READY": "speaking",
      "speaking:PLAYBACK_ENDED": "idle"
    };

    const next = transitions[`${state.status}:${event.type}`] ?? state.status;
    return { status: next as Exclude<SessionStatus, "error"> };
  }
};
