import { describe, expect, it, vi } from "vitest";

const resetPasswordWithToken = vi.fn(async () => "invalid");

vi.mock("@/lib/password-reset", () => ({
  resetPasswordWithToken
}));

vi.mock("@/lib/db", () => ({
  createPrismaClient: vi.fn(() => ({}))
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  })
}));

describe("reset password action", () => {
  it("keeps the token when the replacement password is too short", async () => {
    const { resetPasswordAction } = await import("./actions");
    const formData = new FormData();
    formData.set("token", "abc");
    formData.set("password", "short");

    await expect(resetPasswordAction(formData)).rejects.toThrow("redirect:/reset-password?token=abc&error=invalid");
    expect(resetPasswordWithToken).not.toHaveBeenCalled();
  });

  it("redirects invalid or expired tokens back to the reset page", async () => {
    const { resetPasswordAction } = await import("./actions");
    const formData = new FormData();
    formData.set("token", "expired");
    formData.set("password", "new-password");

    await expect(resetPasswordAction(formData)).rejects.toThrow("redirect:/reset-password?error=invalid");
  });

  it("redirects successful resets back to login with a success message", async () => {
    resetPasswordWithToken.mockResolvedValueOnce("reset");
    const { resetPasswordAction } = await import("./actions");
    const formData = new FormData();
    formData.set("token", "abc");
    formData.set("password", "new-password");

    await expect(resetPasswordAction(formData)).rejects.toThrow("redirect:/login?reset=success");
  });
});
