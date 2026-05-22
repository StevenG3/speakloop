import type { PrismaClient } from "@prisma/client";
import { listDueReviewCards } from "./db";

export async function getDashboardData(prisma: PrismaClient, userId: string) {
  const [user, dueCards, sessions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    }),
    listDueReviewCards(prisma, userId),
    prisma.conversationSession.findMany({
      where: { user_id: userId },
      orderBy: { started_at: "desc" },
      take: 5
    })
  ]);

  return {
    displayName: user?.profile?.display_name ?? "Learner",
    dueCount: dueCards.length,
    streakDays: sessions.length > 0 ? 1 : 0,
    recentSessions: sessions.map((session) => ({
      id: session.id,
      title: `${labelLanguage(session.target_language)} free talk`,
      startedAt: session.started_at.toLocaleDateString("en", { month: "short", day: "numeric" })
    }))
  };
}

function labelLanguage(language: "ko" | "en" | "zh") {
  return { ko: "Korean", en: "English", zh: "Chinese" }[language];
}
