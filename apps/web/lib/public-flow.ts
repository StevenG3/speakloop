import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Password is required.")
});

export const registerFormSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Use at least 8 characters."),
  displayName: z.string().min(1, "Display name is required.")
});

export const onboardingSchema = z.object({
  targetLanguage: z.enum(["ko", "en", "zh"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  goal: z.string().min(1).max(120)
});

export function validateLoginInput(input: unknown) {
  return loginSchema.safeParse(input);
}

export function validateRegisterInput(input: unknown) {
  return registerFormSchema.safeParse(input);
}

export async function persistOnboardingSettings(
  prisma: PrismaClient,
  userId: string,
  input: unknown
) {
  const data = onboardingSchema.parse(input);

  return prisma.userSettings.upsert({
    where: { user_id: userId },
    create: {
      user_id: userId,
      target_language: data.targetLanguage,
      level: data.level,
      goal: data.goal,
      default_speed: 1,
      theme: "system"
    },
    update: {
      target_language: data.targetLanguage,
      level: data.level,
      goal: data.goal
    }
  });
}

export function getLoginRedirect(next: string | null | undefined) {
  if (!next || !next.startsWith("/app")) {
    return "/app";
  }

  return next;
}
