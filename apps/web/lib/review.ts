import { schedule, type ReviewGrade as CoreReviewGrade } from "@speakloop/core";
import type { PrismaClient, ReviewGrade } from "@prisma/client";

export function listReviewQueue(prisma: PrismaClient, userId: string, now = new Date()) {
  return prisma.reviewCard.findMany({
    where: {
      user_id: userId,
      due_at: { lte: now },
      vocabulary_item: { deleted_at: null }
    },
    orderBy: { due_at: "asc" },
    include: { vocabulary_item: { include: { examples: true } } }
  });
}

export async function gradeReviewCard(prisma: PrismaClient, userId: string, cardId: string, grade: ReviewGrade, now = new Date()) {
  const card = await prisma.reviewCard.findFirstOrThrow({
    where: { id: cardId, user_id: userId }
  });
  const next = schedule(card, grade as CoreReviewGrade, now);

  return prisma.$transaction(async (tx) => {
    const updated = await tx.reviewCard.update({
      where: { id: card.id },
      data: {
        ease: next.ease,
        interval_days: next.interval_days,
        repetitions: next.repetitions,
        due_at: next.due_at,
        last_reviewed_at: now
      }
    });
    await tx.reviewEvent.create({
      data: {
        review_card_id: card.id,
        grade,
        prev_interval: card.interval_days,
        next_interval: next.interval_days
      }
    });
    return updated;
  });
}
