"use server";

import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/session";
import { createPrismaClient } from "@/lib/db";
import { createConversationSession } from "@/lib/turn";

const prisma = createPrismaClient();

export async function startPracticeAction(formData: FormData) {
  const session = await getAppSession();
  if (!session?.user?.id) {
    redirect("/login?next=/app/practice");
  }

  const settings = await prisma.userSettings.findUnique({ where: { user_id: session.user.id } });
  const conversation = await createConversationSession(prisma, session.user.id, {
    target_language: settings?.target_language ?? "ko",
    level: settings?.level ?? "beginner",
    speed: Number(formData.get("speed") ?? settings?.default_speed ?? 1)
  });

  redirect(`/app/session/${conversation.id}`);
}
