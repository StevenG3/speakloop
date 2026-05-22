import { redirect } from "next/navigation";
import { createPrismaClient } from "@/lib/db";
import { getAppSession } from "@/lib/session";
import { HistoryList } from "./HistoryList";

const prisma = createPrismaClient();

export default async function HistoryPage() {
  const session = await getAppSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const sessions = await prisma.conversationSession.findMany({
    where: { user_id: session.user.id },
    include: { messages: { orderBy: { created_at: "asc" }, take: 4 } },
    orderBy: { started_at: "desc" }
  });

  return (
    <HistoryList
      sessions={sessions.map((item) => ({
        id: item.id,
        title: `${item.target_language.toUpperCase()} ${item.mode.replace("_", " ")}`,
        startedAt: item.started_at.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }),
        messages: item.messages.map((message) => message.text)
      }))}
    />
  );
}
