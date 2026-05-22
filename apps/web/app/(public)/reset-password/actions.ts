"use server";

import { createPrismaClient } from "@/lib/db";
import { resetPasswordWithToken } from "@/lib/password-reset";
import { redirect } from "next/navigation";

const prisma = createPrismaClient();

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  if (password.length < 8) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=invalid`);
  }

  const result = await resetPasswordWithToken(prisma, token, password);

  if (result !== "reset") {
    redirect("/reset-password?error=invalid");
  }

  redirect("/login?reset=success");
}
