import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cssVariables } from "@speakloop/design-tokens";
import { describe, expect, it } from "vitest";

function renderVariables(selector: string, variables: Record<string, string>) {
  return `${selector} {\n${Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n")}\n}`;
}

describe("global theme CSS", () => {
  it("is generated from design-token cssVariables output", () => {
    const globals = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

    expect(globals).toContain("Generated from @speakloop/design-tokens cssVariables()");
    expect(globals).toContain(renderVariables(":root", cssVariables("light")));
    expect(globals).toContain(renderVariables('[data-theme="dark"]', cssVariables("dark")));
  });
});
