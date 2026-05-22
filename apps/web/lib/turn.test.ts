import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MockLLM, MockSTT, MockTTS, type TTSProvider } from "@speakloop/core";
import type { PrismaClient } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createPrismaClient } from "./db";
import { createConversationSession, handleMockTurn, normalizeTurnBody } from "./turn";

describe("turn orchestration", () => {
  let prisma: PrismaClient;
  let userId: string;
  let sessionId: string;

  beforeEach(async () => {
    const dir = mkdtempSync(join(tmpdir(), "speakloop-turn-"));
    const dbPath = join(dir, "test.db");
    process.env.DATABASE_URL = `file:${dbPath}`;
    execFileSync("sqlite3", [dbPath, `.read ${join(process.cwd(), "../../prisma/migrations/20260521153300_init/migration.sql")}`], {
      stdio: "ignore",
      env: process.env
    });
    prisma = createPrismaClient();
    const user = await prisma.user.create({
      data: {
        email: "turn@speakloop.dev",
        password_hash: "hash",
        settings: {
          create: {
            target_language: "ko",
            level: "beginner",
            goal: "Everyday conversation",
            default_speed: 1,
            theme: "system"
          }
        }
      }
    });
    userId = user.id;
    const session = await createConversationSession(prisma, userId, {
      target_language: "ko",
      level: "beginner",
      speed: 1
    });
    sessionId = session.id;
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  it("runs the mock turn and persists user and assistant messages plus provider logs", async () => {
    const result = await handleMockTurn(prisma, {
      session_id: sessionId,
      user_id: userId,
      audio_fixture: "hello-ko.wav",
      providers: { stt: new MockSTT(), llm: new MockLLM(), tts: new MockTTS() }
    });

    expect(result.user_text).toContain("안녕하세요");
    expect(result.assistant_text).toContain("I heard you say");
    expect(result.audio_url).toBe("/fixtures/audio/tts-mock.wav");
    expect(result.vocab_candidates[0]?.term).toBe("연습");
    await expect(prisma.conversationMessage.count({ where: { session_id: sessionId } })).resolves.toBe(2);
    await expect(prisma.providerRequestLog.count({ where: { trace_id: result.trace_id } })).resolves.toBe(3);
  });

  it("keeps assistant text when TTS fails and logs the failure", async () => {
    const failingTts: TTSProvider = {
      id: "tts-down",
      synthesize: async () => {
        throw new Error("tts unavailable");
      },
      testConnection: async () => ({ ok: false, latency_ms: 1, error: "tts unavailable" })
    };

    const result = await handleMockTurn(prisma, {
      session_id: sessionId,
      user_id: userId,
      audio_fixture: "hello-ko.wav",
      providers: { stt: new MockSTT(), llm: new MockLLM(), tts: failingTts }
    });

    expect(result.assistant_text).toContain("I heard you say");
    expect(result.audio_url).toBeUndefined();
    await expect(
      prisma.providerRequestLog.count({ where: { trace_id: result.trace_id, provider_kind: "tts", status: "error" } })
    ).resolves.toBe(1);
  });

  it("uses the registry-resolved provider config when explicit providers are not injected", async () => {
    await prisma.aiProviderConfig.create({
      data: { vendor: "configured-llm", model: "mock-configured", role: "primary", is_active: true }
    });

    const result = await handleMockTurn(prisma, {
      session_id: sessionId,
      user_id: userId,
      audio_fixture: "hello-ko.wav"
    });

    await expect(
      prisma.providerRequestLog.count({
        where: { trace_id: result.trace_id, provider_kind: "llm", vendor: "configured-llm" }
      })
    ).resolves.toBe(1);
  });

  it("falls back through the registry when the configured primary provider fails", async () => {
    await prisma.aiProviderConfig.create({
      data: { vendor: "fail-mock", model: "mock-primary", role: "primary", is_active: true }
    });
    await prisma.aiProviderConfig.create({
      data: { vendor: "fallback-llm", model: "mock-fallback", role: "fallback", is_active: true }
    });

    const result = await handleMockTurn(prisma, {
      session_id: sessionId,
      user_id: userId,
      audio_fixture: "hello-ko.wav"
    });

    expect(result.assistant_text).toContain("I heard you say");
    await expect(
      prisma.providerRequestLog.count({
        where: { trace_id: result.trace_id, provider_kind: "llm", vendor: "fallback-llm", status: "ok" }
      })
    ).resolves.toBe(1);
  });

  it("normalizes recorded audio metadata from the browser turn request", () => {
    expect(
      normalizeTurnBody({
        session_id: "s1",
        audio_fixture: "hello-ko.wav",
        audio_blob: { type: "audio/webm", size: 2048 }
      })
    ).toEqual({
      session_id: "s1",
      audio_fixture: "hello-ko.wav",
      audio_blob: { type: "audio/webm", size: 2048 }
    });
  });
});
