import { describe, expect, it } from "vitest";
import { createSessionStore } from "./session-store";

describe("session store", () => {
  it("drives the speaking loop state machine", () => {
    const store = createSessionStore();

    store.getState().startRecording();
    expect(store.getState().status).toBe("recording");

    store.getState().stopRecording();
    expect(store.getState().status).toBe("transcribing");

    store.getState().transcriptReady();
    expect(store.getState().status).toBe("thinking");

    store.getState().replyReady();
    expect(store.getState().status).toBe("speaking");

    store.getState().playbackEnded();
    expect(store.getState().status).toBe("idle");
  });
});
