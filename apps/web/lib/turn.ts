import {
  extractVocabularyDrafts,
  type Language,
  type Level,
  type LLMProvider,
  type STTProvider,
  type TTSProvider,
  type VocabCandidate
} from "@speakloop/core";
import type { PrismaClient } from "@prisma/client";
import { resolveProviders } from "./provider-registry";

type Providers = {
  stt: STTProvider;
  llm: LLMProvider;
  tts: TTSProvider;
};

export async function createConversationSession(
  prisma: PrismaClient,
  userId: string,
  input: { target_language: Language; level: Level; speed: number }
) {
  return prisma.conversationSession.create({
    data: {
      user_id: userId,
      target_language: input.target_language,
      mode: "free_talk",
      level: input.level,
      speed: input.speed
    }
  });
}

export async function handleMockTurn(
  prisma: PrismaClient,
  input: {
    session_id: string;
    user_id: string;
    audio_fixture: string;
    audio_blob?: { type: string; size: number };
    speed?: number;
    providers?: Providers;
  }
) {
  const trace_id = `trace-${crypto.randomUUID()}`;
  const session = await prisma.conversationSession.findUniqueOrThrow({ where: { id: input.session_id } });
  const providers = input.providers ?? (await resolveProviders(prisma));
  const turnSpeed = input.speed ?? session.speed;

  const stt = await timedCall(() =>
    providers.stt.transcribe({ audio_fixture: input.audio_fixture, language: session.target_language })
  );
  await logProvider(prisma, trace_id, input.user_id, "stt", stt.ok ? stt.value.provider_id : providers.stt.id, stt);
  if (!stt.ok) {
    throw new Error("STT failed");
  }

  const userMessage = await prisma.conversationMessage.create({
    data: {
      session_id: input.session_id,
      role: "user",
      text: stt.value.text,
      stt_provider: stt.value.provider_id,
      latency_ms: stt.latency_ms
    }
  });

  const llm = await timedCall(() =>
    providers.llm.generateReply({
      messages: [{ role: "user", content: stt.value.text }],
      target_language: session.target_language,
      level: session.level
    })
  );
  await logProvider(prisma, trace_id, input.user_id, "llm", llm.ok ? llm.value.provider_id : providers.llm.id, llm);
  if (!llm.ok) {
    throw new Error("LLM failed");
  }

  const tts = await timedCall(() =>
    providers.tts.synthesize({ text: llm.value.reply, language: session.target_language, speed: turnSpeed })
  );
  await logProvider(prisma, trace_id, input.user_id, "tts", tts.ok ? tts.value.provider_id : providers.tts.id, tts);

  await prisma.conversationMessage.create({
    data: {
      session_id: input.session_id,
      role: "assistant",
      text: llm.value.reply,
      audio_url: tts.ok ? tts.value.audio_url : null,
      llm_provider: llm.value.provider_id,
      tts_provider: tts.ok ? tts.value.provider_id : providers.tts.id,
      latency_ms: llm.latency_ms + (tts.ok ? tts.latency_ms : 0)
    }
  });

  const vocabDrafts = extractVocabularyDrafts(llm.value.vocab_candidates, {
    user_id: input.user_id,
    language: session.target_language,
    source_message_id: userMessage.id
  });

  return {
    trace_id,
    user_text: stt.value.text,
    assistant_text: llm.value.reply,
    audio_url: tts.ok ? tts.value.audio_url : undefined,
    vocab_candidates: llm.value.vocab_candidates,
    vocab_drafts: vocabDrafts
  };
}

export function normalizeTurnBody(body: unknown): {
  session_id: string;
  audio_fixture: string;
  audio_blob?: { type: string; size: number };
  speed?: number;
} {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid turn request");
  }
  const data = body as Record<string, unknown>;
  if (typeof data.session_id !== "string" || typeof data.audio_fixture !== "string") {
    throw new Error("Invalid turn request");
  }
  const audioBlob = normalizeAudioBlob(data.audio_blob);
  return {
    session_id: data.session_id,
    audio_fixture: data.audio_fixture,
    ...(typeof data.speed === "number" ? { speed: data.speed } : {}),
    ...(audioBlob ? { audio_blob: audioBlob } : {})
  };
}

function normalizeAudioBlob(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }
  const data = value as Record<string, unknown>;
  if (typeof data.type !== "string" || typeof data.size !== "number" || data.size <= 0) {
    return null;
  }
  return { type: data.type, size: data.size };
}

async function timedCall<T>(call: () => Promise<T>) {
  const started = Date.now();
  try {
    return { ok: true as const, value: await call(), latency_ms: Math.max(1, Date.now() - started) };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Unknown provider error",
      latency_ms: Math.max(1, Date.now() - started)
    };
  }
}

function logProvider(
  prisma: PrismaClient,
  traceId: string,
  userId: string,
  kind: string,
  vendor: string,
  result: Awaited<ReturnType<typeof timedCall<unknown>>>
) {
  return prisma.providerRequestLog.create({
    data: {
      trace_id: traceId,
      user_id: userId,
      provider_kind: kind,
      vendor,
      latency_ms: result.latency_ms,
      status: result.ok ? "ok" : "error",
      error_code: result.ok ? null : result.error
    }
  });
}

export type TurnResponse = Awaited<ReturnType<typeof handleMockTurn>>;
export type TurnVocabCandidate = VocabCandidate;
