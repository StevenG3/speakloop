"use server";

import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/session";
import { createPrismaClient } from "@/lib/db";
import { createConversationSession } from "@/lib/turn";
import { languages } from "@/lib/i18n";

const prisma = createPrismaClient();

export async function startPracticeAction(formData: FormData) {
  const session = await getAppSession();
  if (!session?.user?.id) {
    redirect("/login?next=/app/practice");
  }

  const settings = await prisma.userSettings.findUnique({ where: { user_id: session.user.id } });
  const requestedLanguage = String(formData.get("targetLanguage") ?? "");
  const targetLanguage = languages.includes(requestedLanguage as never)
    ? (requestedLanguage as "ko" | "en" | "zh")
    : settings?.target_language ?? "ko";

  await prisma.userSettings.upsert({
    where: { user_id: session.user.id },
    create: {
      user_id: session.user.id,
      target_language: targetLanguage,
      level: settings?.level ?? "beginner",
      goal: settings?.goal ?? "Everyday conversation",
      default_speed: Number(formData.get("speed") ?? settings?.default_speed ?? 1),
      theme: settings?.theme ?? "system"
    },
    update: {
      target_language: targetLanguage,
      default_speed: Number(formData.get("speed") ?? settings?.default_speed ?? 1)
    }
  });

  const conversation = await createConversationSession(prisma, session.user.id, {
    target_language: targetLanguage,
    level: settings?.level ?? "beginner",
    speed: Number(formData.get("speed") ?? settings?.default_speed ?? 1)
  });

  redirect(`/app/session/${conversation.id}`);
}
