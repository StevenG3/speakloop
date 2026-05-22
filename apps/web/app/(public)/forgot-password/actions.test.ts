import { describe, expect, it, vi } from "vitest";
import type { PasswordResetResult } from "@/lib/password-reset";

const createPasswordReset = vi.fn<() => Promise<PasswordResetResult | null>>(async () => null);

vi.mock("@/lib/password-reset", () => ({
  createPasswordReset
}));

vi.mock("@/lib/db", () => ({
  createPrismaClient: vi.fn(() => ({}))
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  })
}));

describe("forgot password action", () => {
  it("always redirects to the sent state for missing accounts", async () => {
    const { requestPasswordResetAction } = await import("./actions");
    const formData = new FormData();
    formData.set("email", "missing@speakloop.dev");

    await expect(requestPasswordResetAction(formData)).rejects.toThrow("redirect:/forgot-password?sent=1");
  });

  it("shows a temporary reset link when mock providers are enabled", async () => {
    vi.stubEnv("MOCK_PROVIDERS", "true");
    createPasswordReset.mockResolvedValueOnce({ token: "abc", resetPath: "/reset-password?token=abc" });
    const { requestPasswordResetAction } = await import("./actions");
    const formData = new FormData();
    formData.set("email", "demo@speakloop.dev");

    await expect(requestPasswordResetAction(formData)).rejects.toThrow(
      "redirect:/forgot-password?sent=1&resetLink=%2Freset-password%3Ftoken%3Dabc"
    );

    vi.unstubAllEnvs();
  });

  it("redirects backend failures to a readable retry state", async () => {
    createPasswordReset.mockRejectedValueOnce(new Error("database unavailable"));
    const { requestPasswordResetAction } = await import("./actions");
    const formData = new FormData();
    formData.set("email", "demo@speakloop.dev");

    await expect(requestPasswordResetAction(formData)).rejects.toThrow("redirect:/forgot-password?error=try-again");
  });
});
