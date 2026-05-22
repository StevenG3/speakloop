import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("native iOS path", () => {
  it("documents the chosen iOS migration plan and README run instructions", () => {
    const iosPath = join(process.cwd(), "../../docs/IOS.md");
    const readme = readFileSync(join(process.cwd(), "../../README.md"), "utf8");

    expect(existsSync(iosPath)).toBe(true);
    const ios = readFileSync(iosPath, "utf8");
    expect(ios).toContain("Chosen option: documentation-first native path");
    expect(ios).toContain("NSMicrophoneUsageDescription");
    expect(ios).toContain("Expo Go");
    expect(ios).toContain("TestFlight");
    expect(ios).toContain("@speakloop/core");

    expect(readme).toContain("iOS Native Path");
    expect(readme).toContain("docs/IOS.md");
    expect(readme).toContain("Expo Go");
  });
});
