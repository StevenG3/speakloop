import { describe, expect, it, vi } from "vitest";
import {
  apiSchemas,
  buildFlashbackReviewPrompt,
  buildGrammarCorrectionPrompt,
  buildTutorPrompt,
  buildVocabularyExtractionPrompt,
  extractVocabularyDrafts,
  MockLLM,
  MockSTT,
  MockTTS,
  resolveProviderPair,
  schedule,
  sessionMachine,
  userSchema,
  vocabularyItemSchema
} from "./index";
import type { LLMProvider, STTProvider, TTSProvider } from "./index";

describe("schemas", () => {
  it("validates user and vocabulary domain objects", () => {
    expect(userSchema.parse({ id: "u1", email: "a@speakloop.dev", role: "user" })).toMatchObject({
      id: "u1"
    });

    expect(
      vocabularyItemSchema.parse({
        id: "v1",
        user_id: "u1",
        language: "ko",
        term: "안녕하세요",
        meaning: "hello",
        created_at: new Date()
      })
    ).toMatchObject({ language: "ko" });
  });

  it("validates API request and response shapes", () => {
    expect(apiSchemas.createTurnRequest.parse({ session_id: "s1", audio_fixture: "hello.wav" })).toEqual({
      session_id: "s1",
      audio_fixture: "hello.wav"
    });

    expect(
      apiSchemas.createTurnResponse.parse({
        trace_id: "trace-1",
        user_text: "hello",
        assistant_text: "Nice to meet you.",
        audio_url: "/fixtures/audio/mock-abc.wav",
        vocab_candidates: []
      })
    ).toMatchObject({ trace_id: "trace-1" });
  });
});

describe("provider mocks", () => {
  async function expectLLMContract(provider: LLMProvider) {
    const result = await provider.generateReply({
      messages: [{ role: "user", content: "I go school yesterday" }],
      target_language: "en",
      level: "beginner"
    });

    expect(result.reply).toContain("I heard you");
    expect(result.vocab_candidates[0]?.term).toBeTruthy();
    expect(result.corrections[0]?.fixed).toBeTruthy();
  }

  async function expectSTTContract(provider: STTProvider) {
    const result = await provider.transcribe({ audio_fixture: "hello-ko.wav", language: "ko" });

    expect(result.text).toContain("안녕하세요");
    expect(result.confidence).toBeGreaterThan(0.9);
  }

  async function expectTTSContract(provider: TTSProvider) {
    const result = await provider.synthesize({ text: "hello", language: "en", speed: 1 });

    expect(result.audio_url).toMatch(/^\/fixtures\/audio\/tts-/);
    expect(result.voice_id).toBe("mock-voice");
  }

  it("MockLLM satisfies the LLM contract", async () => {
    await expectLLMContract(new MockLLM());
  });

  it("MockSTT satisfies the STT contract", async () => {
    await expectSTTContract(new MockSTT());
  });

  it("MockTTS satisfies the TTS contract", async () => {
    await expectTTSContract(new MockTTS());
  });

  it("resolves fallback when the primary provider throws", async () => {
    const primary: LLMProvider = {
      id: "primary",
      generateReply: vi.fn().mockRejectedValue(new Error("down")),
      testConnection: vi.fn()
    };
    const fallback = new MockLLM("fallback");

    const provider = resolveProviderPair({ primary, fallback, mockProviders: false });
    const result = await provider.generateReply({
      messages: [{ role: "user", content: "hello" }],
      target_language: "en",
      level: "beginner"
    });

    expect(primary.generateReply).toHaveBeenCalledOnce();
    expect(result.provider_id).toBe("fallback");
  });
});

describe("srs", () => {
  it("schedules again, hard, good, and easy grades with SM-2-lite interval math", () => {
    const now = new Date("2026-05-21T00:00:00.000Z");
    const card = { ease: 2.5, interval_days: 0, repetitions: 0, due_at: now };

    expect(schedule(card, "again", now)).toMatchObject({ ease: 2.3, interval_days: 0, repetitions: 0 });
    expect(schedule(card, "hard", now)).toMatchObject({ ease: 2.35, interval_days: 1, repetitions: 1 });
    expect(schedule(card, "good", now)).toMatchObject({ ease: 2.5, interval_days: 1, repetitions: 1 });
    expect(schedule(card, "easy", now)).toMatchObject({ ease: 2.65, interval_days: 2, repetitions: 1 });
  });
});

describe("prompts", () => {
  it("tutor prompt templates contain required guardrails for every language and level", () => {
    const languages = ["ko", "en", "zh"] as const;
    const levels = ["beginner", "intermediate", "advanced"] as const;

    for (const target_language of languages) {
      for (const level of levels) {
        const text = buildTutorPrompt({ target_language, level, native_language: "en", speed: 1 })
          .map((message) => message.content)
          .join("\n");

        expect(text).toContain("AT MOST 1-2");
        expect(text).toContain("Acknowledge effort");
        expect(text).toContain("immersion");
      }
    }
  });

  it("specialized prompt templates return typed messages", () => {
    expect(buildVocabularyExtractionPrompt({ utterance: "I goed", native_language: "en" })[0]?.role).toBe(
      "system"
    );
    expect(buildGrammarCorrectionPrompt({ utterance: "I goed" })[0]?.content).toContain("AT MOST 1-2");
    expect(buildFlashbackReviewPrompt({ term: "안녕", meaning: "hello", language: "ko" })[0]?.content).toContain(
      "immersion"
    );
  });
});

describe("sessionMachine", () => {
  it("moves through the core speaking loop and returns to idle", () => {
    let state = sessionMachine.transition({ status: "idle" }, { type: "START_RECORDING" });
    expect(state.status).toBe("recording");
    state = sessionMachine.transition(state, { type: "STOP_RECORDING" });
    expect(state.status).toBe("transcribing");
    state = sessionMachine.transition(state, { type: "TRANSCRIPT_READY" });
    expect(state.status).toBe("thinking");
    state = sessionMachine.transition(state, { type: "REPLY_READY" });
    expect(state.status).toBe("speaking");
    state = sessionMachine.transition(state, { type: "PLAYBACK_ENDED" });
    expect(state.status).toBe("idle");
  });

  it("supports error and retry transitions", () => {
    const error = sessionMachine.transition({ status: "recording" }, { type: "FAIL", message: "mic denied" });

    expect(error).toEqual({ status: "error", message: "mic denied", previous: "recording" });
    expect(sessionMachine.transition(error, { type: "RETRY" }).status).toBe("idle");
  });
});

describe("vocabulary", () => {
  it("normalizes LLM vocab candidates into vocabulary item drafts", () => {
    expect(
      extractVocabularyDrafts(
        [
          {
            term: " Hello ",
            reading: "",
            meaning: " greeting ",
            example: "Hello there"
          }
        ],
        { user_id: "u1", language: "en", source_message_id: "m1" }
      )
    ).toEqual([
      {
        user_id: "u1",
        language: "en",
        term: "hello",
        reading: undefined,
        meaning: "greeting",
        source_message_id: "m1",
        examples: [{ sentence: "Hello there" }]
      }
    ]);
  });
});
