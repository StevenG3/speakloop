import type { PrismaClient } from "@prisma/client";
import { createHash, randomBytes } from "node:crypto";
import { hashPassword } from "./auth";

const tokenBytes = 24;
const tokenTtlMs = 1000 * 60 * 30;

export type PasswordResetResult = {
  token: string;
  resetPath: string;
};

export async function createPasswordReset(prisma: PrismaClient, email: string, now = new Date()): Promise<PasswordResetResult | null> {
  const user = await prisma.user.findFirst({ where: { email: email.trim().toLowerCase(), deleted_at: null } });

  if (!user) {
    return null;
  }

  const token = randomBytes(tokenBytes).toString("base64url");
  await prisma.passwordResetToken.create({
    data: {
      user_id: user.id,
      token_hash: hashToken(token),
      expires_at: new Date(now.getTime() + tokenTtlMs)
    }
  });

  return {
    token,
    resetPath: `/reset-password?token=${encodeURIComponent(token)}`
  };
}

export async function resetPasswordWithToken(
  prisma: PrismaClient,
  token: string,
  password: string,
  now = new Date()
): Promise<"reset" | "invalid"> {
  const reset = await prisma.passwordResetToken.findUnique({
    where: { token_hash: hashToken(token) },
    include: { user: true }
  });

  if (!reset || reset.used_at || reset.expires_at <= now || reset.user.deleted_at) {
    return "invalid";
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.user_id },
      data: { password_hash: await hashPassword(password) }
    }),
    prisma.passwordResetToken.update({
      where: { id: reset.id },
      data: { used_at: now }
    })
  ]);

  return "reset";
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
