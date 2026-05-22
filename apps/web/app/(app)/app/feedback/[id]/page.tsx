import { redirect } from "next/navigation";
import { Card, EmptyState } from "@/components/ui";
import { createPrismaClient } from "@/lib/db";
import { getAppSession } from "@/lib/session";

const prisma = createPrismaClient();

export default async function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAppSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const feedback = await prisma.pronunciationFeedback.findUnique({
    where: { id },
    include: { message: { include: { session: true } } }
  });

  if (!feedback || feedback.message.session.user_id !== session.user.id) {
    return <EmptyState title="No pronunciation feedback yet" />;
  }

  return (
    <Card>
      <h1 className="text-2xl font-bold">Pronunciation feedback</h1>
      <p className="mt-3 text-sm text-[var(--text-muted)]">Score</p>
      <p className="text-3xl font-bold">{Math.round(feedback.score * 100)}%</p>
      <pre className="mt-4 overflow-auto rounded-md bg-[var(--surface-elevated)] p-3 text-sm">{feedback.phoneme_notes}</pre>
    </Card>
  );
}
