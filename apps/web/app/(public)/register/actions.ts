"use server";

import { registerUser } from "@/lib/auth";
import { createPrismaClient } from "@/lib/db";
import { redirect } from "next/navigation";

const prisma = createPrismaClient();

export async function registerAction(formData: FormData) {
  try {
    await registerUser(prisma, {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      displayName: String(formData.get("displayName") ?? ""),
      nativeLanguage: String(formData.get("nativeLanguage") ?? "en") as "ko" | "en" | "zh"
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Email is already registered") {
      redirect("/register?error=email-registered");
    }

    throw error;
  }

  redirect("/onboarding");
}
