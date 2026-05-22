import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("premium UI design rules", () => {
  it("documents the Round-2 elevated iOS-native design direction", () => {
    const design = readFileSync(join(process.cwd(), "../../DESIGN.md"), "utf8");

    expect(design).toContain("Warm elevated gradient");
    expect(design).toContain("Elevation scale");
    expect(design).toContain("Voice interaction area");
    expect(design).toContain("Admin separation");
    expect(design).toContain("Loading / empty / error states");
  });
});
