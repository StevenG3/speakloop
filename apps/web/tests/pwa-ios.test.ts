import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { metadata, viewport } from "../app/layout";
import manifest from "../app/manifest";

describe("PWA and iOS readiness", () => {
  it("serves installable app metadata and manifest", () => {
    expect(viewport).toMatchObject({
      width: "device-width",
      initialScale: 1,
      viewportFit: "cover"
    });
    expect(metadata.manifest).toBe("/manifest.webmanifest");
    expect(metadata.appleWebApp).toMatchObject({ capable: true, title: "SpeakLoop" });

    const appManifest = manifest();
    expect(appManifest.name).toBe("SpeakLoop");
    expect(appManifest.display).toBe("standalone");
    expect(appManifest.icons?.length).toBeGreaterThanOrEqual(2);
    for (const icon of appManifest.icons ?? []) {
      expect(existsSync(join(process.cwd(), "public", icon.src))).toBe(true);
    }
  });

  it("applies safe-area padding to app chrome and session controls", () => {
    const appShell = readFileSync(join(process.cwd(), "components/ui.tsx"), "utf8");
    const sessionView = readFileSync(join(process.cwd(), "app/(app)/app/session/[id]/SessionView.tsx"), "utf8");

    expect(appShell).toContain("env(safe-area-inset-top)");
    expect(appShell).toContain("env(safe-area-inset-bottom)");
    expect(sessionView).toContain("env(safe-area-inset-bottom)");
  });

  it("documents iOS Safari audio constraints", () => {
    const docs = readFileSync(join(process.cwd(), "../../docs/IOS_AUDIO.md"), "utf8");

    expect(docs).toContain("MediaRecorder");
    expect(docs).toContain("user gesture");
    expect(docs).toContain("audio/mp4");
  });
});
