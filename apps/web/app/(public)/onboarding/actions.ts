"use server";

import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/session";
import { createPrismaClient } from "@/lib/db";
import { persistOnboardingSettings } from "@/lib/public-flow";

const prisma = createPrismaClient();

export async function onboardingAction(formData: FormData) {
  const session = await getAppSession();
  if (!session?.user?.id) {
    redirect("/login?next=/onboarding");
  }

  await persistOnboardingSettings(prisma, session.user.id, {
    targetLanguage: String(formData.get("targetLanguage")),
    level: String(formData.get("level")),
    goal: String(formData.get("goal"))
  });

  redirect("/app");
}
