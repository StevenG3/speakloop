import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { createTestPrismaClient } from "./test-db";
import { listVocabularyBook, saveVocabularyFromSession, softDeleteVocabularyItem } from "./vocab";

describe("vocabulary book service", () => {
  let prisma: PrismaClient;
  let userId: string;
  let messageId: string;

  beforeEach(async () => {
    prisma = createTestPrismaClient("speakloop-vocab-");
    const user = await prisma.user.create({ data: { email: "vocab@speakloop.dev", password_hash: "hash" } });
    const session = await prisma.conversationSession.create({
      data: { user_id: user.id, target_language: "ko", mode: "free_talk", level: "beginner", speed: 1 }
    });
    const message = await prisma.conversationMessage.create({
      data: { session_id: session.id, role: "user", text: "안녕하세요" }
    });
    userId = user.id;
    messageId = message.id;
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  it("saves a selected term with examples and creates a due review card", async () => {
    const vocab = await saveVocabularyFromSession(prisma, userId, {
      language: "ko",
      term: "안녕하세요",
      reading: "annyeonghaseyo",
      meaning: "hello",
      source_message_id: messageId,
      examples: [{ sentence: "안녕하세요, 반가워요.", translation: "Hello, nice to meet you." }]
    });

    expect(vocab.term).toBe("안녕하세요");
    await expect(prisma.vocabularyExample.count({ where: { vocabulary_item_id: vocab.id } })).resolves.toBe(1);
    const card = await prisma.reviewCard.findUnique({ where: { vocabulary_item_id: vocab.id } });
    expect(card?.user_id).toBe(userId);
    expect(card?.due_at.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it("hides soft-deleted items from the book", async () => {
    const vocab = await saveVocabularyFromSession(prisma, userId, {
      language: "en",
      term: "visible",
      meaning: "shown",
      examples: []
    });

    await softDeleteVocabularyItem(prisma, userId, vocab.id);

    await expect(listVocabularyBook(prisma, userId)).resolves.toEqual([]);
  });

  it("searches active items by term and meaning", async () => {
    await saveVocabularyFromSession(prisma, userId, { language: "en", term: "listen", meaning: "hear carefully", examples: [] });
    await saveVocabularyFromSession(prisma, userId, { language: "zh", term: "谢谢", meaning: "thanks", examples: [] });

    const byMeaning = await listVocabularyBook(prisma, userId, "thanks");
    expect(byMeaning).toHaveLength(1);
    expect(byMeaning[0]?.language).toBe("zh");
  });
});
