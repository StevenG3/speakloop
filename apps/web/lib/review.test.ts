import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { createTestPrismaClient } from "./test-db";
import { gradeReviewCard, listReviewQueue } from "./review";

describe("review service", () => {
  let prisma: PrismaClient;
  let userId: string;
  let cardId: string;

  beforeEach(async () => {
    prisma = createTestPrismaClient("speakloop-review-");
    const user = await prisma.user.create({ data: { email: "review@speakloop.dev", password_hash: "hash" } });
    const vocab = await prisma.vocabularyItem.create({
      data: { user_id: user.id, language: "en", term: "practice", meaning: "repeat to improve" }
    });
    const card = await prisma.reviewCard.create({
      data: {
        user_id: user.id,
        vocabulary_item_id: vocab.id,
        ease: 2.5,
        interval_days: 0,
        repetitions: 0,
        due_at: new Date("2026-05-20T00:00:00Z")
      }
    });
    userId = user.id;
    cardId = card.id;
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  it("lists due cards with vocabulary details", async () => {
    const queue = await listReviewQueue(prisma, userId, new Date("2026-05-21T00:00:00Z"));

    expect(queue).toHaveLength(1);
    expect(queue[0]?.vocabulary_item.term).toBe("practice");
  });

  it("grades a card with SM-2-lite and appends a review event", async () => {
    const updated = await gradeReviewCard(prisma, userId, cardId, "good", new Date("2026-05-21T00:00:00Z"));

    expect(updated.interval_days).toBe(1);
    expect(updated.repetitions).toBe(1);
    await expect(prisma.reviewEvent.count({ where: { review_card_id: cardId, grade: "good" } })).resolves.toBe(1);
  });
});
