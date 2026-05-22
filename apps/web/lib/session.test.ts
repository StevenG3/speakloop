import { describe, expect, it, vi } from "vitest";

vi.mock("./next-auth", () => ({
  auth: vi.fn(async () => null)
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get(name: string) {
      const forged: Record<string, { value: string }> = {
        speakloop_user_id: { value: "attacker" },
        speakloop_user_email: { value: "attacker@speakloop.dev" },
        speakloop_user_role: { value: "admin" }
      };
      return forged[name];
    }
  }))
}));

describe("app session security", () => {
  it("ignores forged plain cookies and only trusts the signed NextAuth session", async () => {
    const { getAppSession } = await import("./session");

    await expect(getAppSession()).resolves.toBeNull();
  });
});
