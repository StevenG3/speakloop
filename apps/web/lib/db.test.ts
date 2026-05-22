import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createPrismaClient, listActiveVocabularyItems, listDueReviewCards } from "./db";

describe("Prisma schema", () => {
  let prisma: PrismaClient;

  beforeEach(() => {
    const dir = mkdtempSync(join(tmpdir(), "speakloop-prisma-"));
    const dbPath = join(dir, "test.db");
    process.env.DATABASE_URL = `file:${dbPath}`;
    execFileSync("sqlite3", [dbPath, `.read ${join(process.cwd(), "../../prisma/migrations/20260521153300_init/migration.sql")}`], {
      stdio: "ignore",
      env: process.env
    });
    prisma = createPrismaClient();
  });

  afterEach(async () => {
    await prisma?.$disconnect();
  });

  it("creates and reads the core learning entities", async () => {
    const user = await prisma.user.create({
      data: {
        email: "demo@speakloop.dev",
        password_hash: "hash",
        profile: { create: { display_name: "Demo", native_language: "en" } },
        roles: { create: { role: "user" } },
        settings: { create: { target_language: "ko", level: "beginner", default_speed: 1, theme: "light" } }
      }
    });
    const session = await prisma.conversationSession.create({
      data: { user_id: user.id, target_language: "ko", mode: "free_talk", level: "beginner", speed: 1 }
    });
    const message = await prisma.conversationMessage.create({
      data: { session_id: session.id, role: "user", text: "안녕하세요" }
    });
    const vocab = await prisma.vocabularyItem.create({
      data: {
        user_id: user.id,
        language: "ko",
        term: "안녕하세요",
        meaning: "hello",
        source_message_id: message.id,
        examples: { create: { sentence: "안녕하세요", translation: "hello" } }
      }
    });
    const card = await prisma.reviewCard.create({
      data: { user_id: user.id, vocabulary_item_id: vocab.id, ease: 2.5, interval_days: 0, repetitions: 0, due_at: new Date() }
    });
    await prisma.reviewEvent.create({
      data: { review_card_id: card.id, grade: "good", prev_interval: 0, next_interval: 1 }
    });
    await prisma.pronunciationFeedback.create({ data: { message_id: message.id, score: 0.9, phoneme_notes: "{}" } });
    await prisma.providerRequestLog.create({
      data: { trace_id: "trace-1", user_id: user.id, provider_kind: "llm", vendor: "mock", latency_ms: 1, status: "ok" }
    });

    expect(await prisma.user.count()).toBe(1);
    expect(await prisma.vocabularyExample.count()).toBe(1);
    expect(await prisma.reviewEvent.count()).toBe(1);
    expect(await prisma.pronunciationFeedback.count()).toBe(1);
    expect(await prisma.providerRequestLog.count()).toBe(1);
  });

  it("filters soft-deleted vocabulary items", async () => {
    const user = await prisma.user.create({ data: { email: "soft@speakloop.dev", password_hash: "hash" } });
    await prisma.vocabularyItem.create({
      data: { user_id: user.id, language: "en", term: "visible", meaning: "visible" }
    });
    await prisma.vocabularyItem.create({
      data: { user_id: user.id, language: "en", term: "hidden", meaning: "hidden", deleted_at: new Date() }
    });

    await expect(listActiveVocabularyItems(prisma, user.id)).resolves.toHaveLength(1);
  });

  it("returns due review cards by user and due_at", async () => {
    const user = await prisma.user.create({ data: { email: "due@speakloop.dev", password_hash: "hash" } });
    const vocab = await prisma.vocabularyItem.create({
      data: { user_id: user.id, language: "en", term: "practice", meaning: "practice" }
    });
    await prisma.reviewCard.create({
      data: { user_id: user.id, vocabulary_item_id: vocab.id, ease: 2.5, interval_days: 0, repetitions: 0, due_at: new Date("2026-05-20T00:00:00Z") }
    });
    const futureVocab = await prisma.vocabularyItem.create({
      data: { user_id: user.id, language: "en", term: "later", meaning: "later" }
    });
    await prisma.reviewCard.create({
      data: { user_id: user.id, vocabulary_item_id: futureVocab.id, ease: 2.5, interval_days: 3, repetitions: 1, due_at: new Date("2026-05-30T00:00:00Z") }
    });

    await expect(listDueReviewCards(prisma, user.id, new Date("2026-05-21T00:00:00Z"))).resolves.toHaveLength(1);
  });
});
