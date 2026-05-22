import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MockTTS } from "@speakloop/core";

describe("TTS audio fixtures", () => {
  it("MockTTS returns an audio_url that exists in the web public directory", async () => {
    const result = await new MockTTS().synthesize({ text: "hello", language: "en", speed: 1 });
    const publicPath = join(process.cwd(), "public", result.audio_url.replace(/^\//, ""));

    expect(existsSync(publicPath)).toBe(true);
  });
});
