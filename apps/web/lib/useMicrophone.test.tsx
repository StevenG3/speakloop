// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MicPermissionGate } from "./useMicrophone";

class FakeMediaRecorder {
  static supportedType = "";

  static isTypeSupported(_type?: string) {
    void _type;
    return true;
  }

  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  state = "inactive";

  constructor(readonly stream: MediaStream, readonly options?: MediaRecorderOptions) {}

  start() {
    this.state = "recording";
  }

  stop() {
    this.state = "inactive";
    this.ondataavailable?.({ data: new Blob(["voice"], { type: this.options?.mimeType ?? "audio/webm" }) });
    this.onstop?.();
  }
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("useMicrophone", () => {
  it("requests permission on user action, records audio, and exposes a blob with duration", async () => {
    vi.stubGlobal("MediaRecorder", FakeMediaRecorder);
    const getUserMedia = vi.fn(async () => ({ getTracks: () => [{ stop: vi.fn() }] }));
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia }
    });

    const { MicrophoneHarness } = await import("./useMicrophone.test-harness");
    render(<MicrophoneHarness />);

    expect(getUserMedia).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Start recording" }));
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
    await userEvent.click(screen.getByRole("button", { name: "Stop recording" }));

    await waitFor(() => expect(screen.getByText("permission: granted")).toBeInTheDocument());
    expect(screen.getByText(/blob: audio\/webm/)).toBeInTheDocument();
    expect(screen.getByText(/duration: \d+ms/)).toBeInTheDocument();
  });

  it("renders a recovery card when microphone permission is denied", () => {
    render(<MicPermissionGate permission="denied" onRequest={() => undefined} />);

    expect(screen.getByText("Microphone access is blocked")).toBeInTheDocument();
    expect(screen.getByText(/browser settings/)).toBeInTheDocument();
  });

  it("chooses an iOS-compatible recording mime type when webm is unsupported", async () => {
    class IosMediaRecorder extends FakeMediaRecorder {
      static override isTypeSupported(type: string) {
        return type === "audio/mp4";
      }
    }
    vi.stubGlobal("MediaRecorder", IosMediaRecorder);
    const getUserMedia = vi.fn(async () => ({ getTracks: () => [{ stop: vi.fn() }] }));
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia }
    });

    const { MicrophoneHarness } = await import("./useMicrophone.test-harness");
    render(<MicrophoneHarness />);

    await userEvent.click(screen.getByRole("button", { name: "Start recording" }));
    await userEvent.click(screen.getByRole("button", { name: "Stop recording" }));

    await waitFor(() => expect(screen.getByText(/blob: audio\/mp4/)).toBeInTheDocument());
  });
});
