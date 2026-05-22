import { describe, expect, it, vi } from "vitest";

const registerUser = vi.fn(async () => undefined);

vi.mock("@/lib/auth", () => ({
  registerUser
}));

vi.mock("@/lib/db", () => ({
  createPrismaClient: vi.fn(() => ({}))
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  })
}));

describe("register action", () => {
  it("redirects duplicate email attempts back to registration with a friendly error", async () => {
    registerUser.mockRejectedValueOnce(new Error("Email is already registered"));
    const { registerAction } = await import("./actions");
    const formData = new FormData();
    formData.set("email", "demo@speakloop.dev");
    formData.set("password", "demo12345");
    formData.set("displayName", "Demo");
    formData.set("nativeLanguage", "zh");

    await expect(registerAction(formData)).rejects.toThrow("redirect:/register?error=email-registered");
  });
});
