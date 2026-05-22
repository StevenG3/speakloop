// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../app/(app)/app/practice/actions", () => ({ startPracticeAction: vi.fn() }));

let PracticeSetup: (typeof import("../app/(app)/app/practice/PracticeSetup"))["PracticeSetup"];
let SessionView: (typeof import("../app/(app)/app/session/[id]/SessionView"))["SessionView"];

beforeAll(async () => {
  PracticeSetup = (await import("../app/(app)/app/practice/PracticeSetup")).PracticeSetup;
  SessionView = (await import("../app/(app)/app/session/[id]/SessionView")).SessionView;
});

afterEach(() => cleanup());

describe("practice setup", () => {
  it("shows free-talk enabled and other modes locked", () => {
    render(<PracticeSetup defaultSpeed={1} />);

    expect(screen.getByRole("radio", { name: "Free talk" })).toBeEnabled();
    expect(screen.getByRole("radio", { name: "Scenario Locked" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "Pronunciation Locked" })).toBeDisabled();
    expect(screen.getByRole("slider", { name: "Speed" })).toHaveAttribute("min", "0.5");
  });
});

describe("session view", () => {
  it("renders state-specific speaking loop indicators", () => {
    render(<SessionView sessionId="s1" status="recording" messages={[]} />);
    expect(screen.getByText("Recording")).toBeInTheDocument();

    cleanup();
    render(<SessionView sessionId="s1" status="transcribing" messages={[]} />);
    expect(screen.getByText("Transcribing...")).toBeInTheDocument();

    cleanup();
    render(<SessionView sessionId="s1" status="thinking" messages={[]} />);
    expect(screen.getByText("Thinking...")).toBeInTheDocument();
  });

  it("renders optimistic user and assistant placeholders", () => {
    render(
      <SessionView
        sessionId="s1"
        status="thinking"
        messages={[
          { id: "optimistic-user", role: "user", text: "Transcribing...", pending: true },
          { id: "optimistic-assistant", role: "assistant", text: "Thinking...", pending: true }
        ]}
      />
    );

    expect(screen.getByText("Transcribing...")).toBeInTheDocument();
    expect(screen.getAllByText("Thinking...").length).toBeGreaterThanOrEqual(1);
  });

  it("keeps failed turns visible with retry controls", () => {
    render(
      <SessionView
        sessionId="s1"
        status="error"
        error="Tutor is thinking slowly."
        messages={[{ id: "u1", role: "user", text: "Hello", error: true }]}
      />
    );

    expect(screen.getByText("Tutor is thinking slowly.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry turn" })).toBeInTheDocument();
  });

  it("shows a microphone permission gate before prompting for access", () => {
    const getUserMedia = vi.fn();
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia }
    });

    render(<SessionView sessionId="s1" status="idle" messages={[]} />);

    expect(screen.getByRole("heading", { name: "Enable microphone" })).toBeInTheDocument();
    expect(getUserMedia).not.toHaveBeenCalled();
  });
});
