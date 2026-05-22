import { PrismaClient } from "@prisma/client";

export function createPrismaClient() {
  return new PrismaClient();
}

export function listActiveVocabularyItems(prisma: PrismaClient, userId: string) {
  return prisma.vocabularyItem.findMany({
    where: { user_id: userId, deleted_at: null },
    orderBy: { created_at: "desc" }
  });
}

export function listDueReviewCards(prisma: PrismaClient, userId: string, now = new Date()) {
  return prisma.reviewCard.findMany({
    where: {
      user_id: userId,
      due_at: { lte: now },
      vocabulary_item: { deleted_at: null }
    },
    orderBy: { due_at: "asc" },
    include: { vocabulary_item: true }
  });
}
