"use server";

import { redirect } from "next/navigation";
import { authenticateUser } from "@/lib/auth";
import { createPrismaClient } from "@/lib/db";
import { getLoginRedirect } from "@/lib/public-flow";
import { setAppSessionCookie } from "@/lib/session";

const prisma = createPrismaClient();

export async function loginAction(formData: FormData) {
  const user = await authenticateUser(
    prisma,
    String(formData.get("email") ?? ""),
    String(formData.get("password") ?? "")
  );
  if (!user) {
    redirect("/login");
  }

  await setAppSessionCookie(user);
  redirect(getLoginRedirect(String(formData.get("redirectTo") ?? "")));
}
