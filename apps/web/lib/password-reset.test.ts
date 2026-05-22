import type { PrismaClient } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { registerUser, verifyPassword } from "./auth";
import { createTestPrismaClient } from "./test-db";
import { createPasswordReset, resetPasswordWithToken } from "./password-reset";

describe("password reset", () => {
  let prisma: PrismaClient;

  beforeEach(async () => {
    prisma = createTestPrismaClient("speakloop-reset-");
    await registerUser(prisma, {
      email: "reset@speakloop.dev",
      password: "old-password",
      displayName: "Reset User",
      nativeLanguage: "zh"
    });
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  it("creates a token for an existing email and resets the password once", async () => {
    const reset = await createPasswordReset(prisma, "reset@speakloop.dev", new Date("2026-05-22T00:00:00Z"));

    expect(reset?.token).toHaveLength(32);

    const result = await resetPasswordWithToken(prisma, reset!.token, "new-password", new Date("2026-05-22T00:05:00Z"));
    const user = await prisma.user.findUniqueOrThrow({ where: { email: "reset@speakloop.dev" } });

    expect(result).toBe("reset");
    expect(await verifyPassword("new-password", user.password_hash)).toBe(true);
    await expect(resetPasswordWithToken(prisma, reset!.token, "other-password")).resolves.toBe("invalid");
  });

  it("does not reveal whether an email exists", async () => {
    await expect(createPasswordReset(prisma, "missing@speakloop.dev")).resolves.toBeNull();
  });

  it("rejects expired tokens without changing the password", async () => {
    const reset = await createPasswordReset(prisma, "reset@speakloop.dev", new Date("2026-05-22T00:00:00Z"));

    await expect(resetPasswordWithToken(prisma, reset!.token, "new-password", new Date("2026-05-22T00:31:00Z"))).resolves.toBe(
      "invalid"
    );

    const user = await prisma.user.findUniqueOrThrow({ where: { email: "reset@speakloop.dev" } });
    expect(await verifyPassword("old-password", user.password_hash)).toBe(true);
  });
});
