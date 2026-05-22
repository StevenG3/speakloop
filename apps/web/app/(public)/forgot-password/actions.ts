"use server";

import { createPrismaClient } from "@/lib/db";
import { createPasswordReset } from "@/lib/password-reset";
import { redirect } from "next/navigation";

const prisma = createPrismaClient();

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  let reset;

  try {
    reset = await createPasswordReset(prisma, email);
  } catch {
    redirect("/forgot-password?error=try-again");
  }

  const params = new URLSearchParams({ sent: "1" });

  if (reset && (process.env.NODE_ENV !== "production" || process.env.MOCK_PROVIDERS === "true")) {
    params.set("resetLink", reset.resetPath);
  }

  redirect(`/forgot-password?${params.toString()}`);
}
