import { describe, expect, it, vi } from "vitest";

const signIn = vi.fn(async () => undefined);

vi.mock("@/lib/next-auth", () => ({
  signIn
}));

vi.mock("@/lib/auth", () => ({
  authenticateUser: vi.fn(async () => ({ id: "u1", email: "demo@speakloop.dev", role: "user" }))
}));

vi.mock("@/lib/session", () => ({
  setAppSessionCookie: vi.fn(async () => undefined)
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`);
  })
}));

describe("login action", () => {
  it("authenticates through NextAuth credentials so the session is signed", async () => {
    const { loginAction } = await import("./actions");
    const formData = new FormData();
    formData.set("email", "demo@speakloop.dev");
    formData.set("password", "demo12345");
    formData.set("redirectTo", "/app/practice");

    await loginAction(formData);

    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "demo@speakloop.dev",
      password: "demo12345",
      redirectTo: "/app/practice"
    });
  });

  it("redirects invalid credentials back to login with a readable error", async () => {
    signIn.mockRejectedValueOnce(Object.assign(new Error("CredentialsSignin"), { type: "CredentialsSignin" }));
    const { loginAction } = await import("./actions");
    const formData = new FormData();
    formData.set("email", "demo@speakloop.dev");
    formData.set("password", "wrong-password");
    formData.set("redirectTo", "/app/practice");

    await expect(loginAction(formData)).rejects.toThrow("redirect:/login?error=invalid-credentials&next=%2Fapp%2Fpractice");
  });
});
