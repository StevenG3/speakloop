// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { useSessionStore } from "../lib/session-store";

vi.mock("../lib/useMicrophone", () => ({
  MicPermissionGate: () => null,
  useMicrophone: () => ({
    permission: "granted",
    blob: new Blob(["voice"], { type: "audio/webm" }),
    durationMs: 100,
    requestPermission: vi.fn(),
    start: vi.fn(async () => undefined),
    stop: vi.fn(async () => new Blob(["voice"], { type: "audio/webm" }))
  })
}));

let SessionView: (typeof import("../app/(app)/app/session/[id]/SessionView"))["SessionView"];

beforeAll(async () => {
  SessionView = (await import("../app/(app)/app/session/[id]/SessionView")).SessionView;
});

afterEach(() => {
  cleanup();
  useSessionStore.setState({ status: "idle", error: undefined, speed: 1 });
  vi.restoreAllMocks();
});

describe("session interactions", () => {
  it("sends the selected speed with the recorded turn", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      void input;
      void init;
      return Response.json({ user_text: "hi", assistant_text: "hello", vocab_candidates: [] });
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<SessionView sessionId="s1" status="idle" messages={[]} />);

    fireEvent.change(screen.getByRole("slider", { name: "Speed" }), { target: { value: "1.4" } });
    await userEvent.click(screen.getByRole("button", { name: "Push to talk" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const request = fetchMock.mock.calls[0]?.[1];
    expect(JSON.parse(String(request?.body))).toMatchObject({
      session_id: "s1",
      speed: 1.4,
      audio_blob: { type: "audio/webm", size: 5 }
    });
  });

  it("retry re-runs the failed turn", async () => {
    const fetchMock = vi.fn(async () => Response.json({ user_text: "again", assistant_text: "ok", vocab_candidates: [] }));
    vi.stubGlobal("fetch", fetchMock);
    render(<SessionView sessionId="s1" status="error" error="Turn failed." messages={[{ id: "u1", role: "user", text: "Hi" }]} />);

    await userEvent.click(screen.getByRole("button", { name: "Retry turn" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  });

  it("applies selected playback speed to assistant audio", () => {
    render(
      <SessionView
        sessionId="s1"
        status="idle"
        messages={[{ id: "a1", role: "assistant", text: "hello", audioUrl: "/fixtures/audio/tts-mock.wav" }]}
      />
    );

    fireEvent.change(screen.getByRole("slider", { name: "Speed" }), { target: { value: "1.3" } });

    expect(screen.getByTestId("audio-a1")).toHaveAttribute("data-playback-rate", "1.3");
  });

  it("renders status from the session store state machine", () => {
    render(<SessionView sessionId="s1" status="idle" messages={[]} />);

    act(() => useSessionStore.getState().startRecording());

    expect(screen.getByText("Recording")).toBeInTheDocument();
  });

  it("renders a large voice interaction area with state-specific copy", () => {
    render(<SessionView sessionId="s1" status="thinking" messages={[]} />);

    expect(screen.getByRole("region", { name: "Voice interaction" })).toBeInTheDocument();
    expect(screen.getByText("Thinking with your tutor")).toBeInTheDocument();
  });
});
