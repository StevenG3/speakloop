import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/session";
import { createPrismaClient } from "@/lib/db";
import { SessionView } from "./SessionView";

const prisma = createPrismaClient();

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAppSession();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const { id } = await params;
  const conversation = await prisma.conversationSession.findFirst({
    where: { id, user_id: session.user.id },
    include: { messages: { orderBy: { created_at: "asc" } } }
  });
  if (!conversation) {
    redirect("/app/practice");
  }

  return (
    <SessionView
      sessionId={conversation.id}
      targetLanguage={conversation.target_language}
      status="idle"
      messages={conversation.messages.map((message) => ({
        id: message.id,
        role: message.role,
        text: message.text,
        ...(message.audio_url ? { audioUrl: message.audio_url } : {})
      }))}
    />
  );
}
