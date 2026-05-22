import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("CI and Playwright visual regression", () => {
  it("uses Playwright visual assertions instead of baseline-writing screenshots", () => {
    const spec = readFileSync(join(process.cwd(), "e2e/phase1.spec.ts"), "utf8");

    expect(spec).not.toContain("page.screenshot(");
    expect(spec).toContain("toHaveScreenshot");
    expect(spec).toContain("mobile viewport");
    expect(spec).toContain("scrollWidth");
  });

  it("installs browsers and initializes git in CI from the repo root", () => {
    const ci = readFileSync(join(process.cwd(), "../../.github/workflows/ci.yml"), "utf8");

    expect(ci).toContain("git init");
    expect(ci).toContain("pnpm --filter @speakloop/web exec playwright install --with-deps");
    expect(ci).toContain("working-directory: .");
    expect(ci).not.toContain("cache: pnpm");
    expect(ci).not.toContain("cache-dependency-path");
  });
});
