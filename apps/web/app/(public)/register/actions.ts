"use server";

import { registerUser } from "@/lib/auth";
import { createPrismaClient } from "@/lib/db";
import { redirect } from "next/navigation";

const prisma = createPrismaClient();

export async function registerAction(formData: FormData) {
  await registerUser(prisma, {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    displayName: String(formData.get("displayName") ?? ""),
    nativeLanguage: "en"
  });

  redirect("/onboarding");
}
