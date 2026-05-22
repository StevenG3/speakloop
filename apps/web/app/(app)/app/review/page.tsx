import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/session";
import { createPrismaClient } from "@/lib/db";
import { listReviewQueue } from "@/lib/review";
import { ReviewQueue } from "./ReviewQueue";

const prisma = createPrismaClient();

export default async function ReviewPage() {
  const session = await getAppSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const cards = await listReviewQueue(prisma, session.user.id);

  return (
    <ReviewQueue
      cards={cards.map((card, index) => ({
        id: card.id,
        term: card.vocabulary_item.term,
        meaning: card.vocabulary_item.meaning,
        language: card.vocabulary_item.language,
        progressLabel: `${index + 1} of ${cards.length}`
      }))}
    />
  );
}
