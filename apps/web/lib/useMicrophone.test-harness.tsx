"use client";

import React from "react";
import { useMicrophone } from "./useMicrophone";

export function MicrophoneHarness() {
  const microphone = useMicrophone();

  return (
    <div>
      <p>permission: {microphone.permission}</p>
      <p>blob: {microphone.blob?.type ?? "none"}</p>
      <p>duration: {microphone.durationMs}ms</p>
      <button type="button" onClick={() => void microphone.start()}>
        Start recording
      </button>
      <button type="button" onClick={() => void microphone.stop()}>
        Stop recording
      </button>
    </div>
  );
}
