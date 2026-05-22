import { z } from "zod";

export const languageSchema = z.enum(["ko", "en", "zh"]);
export const levelSchema = z.enum(["beginner", "intermediate", "advanced"]);
export const roleSchema = z.enum(["user", "admin"]);
export const messageRoleSchema = z.enum(["system", "user", "assistant"]);

export const userSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  role: roleSchema,
  created_at: z.date().optional(),
  deleted_at: z.date().nullable().optional()
});

export const sessionSchema = z.object({
  id: z.string().min(1),
  user_id: z.string().min(1),
  target_language: languageSchema,
  mode: z.literal("free_talk"),
  level: levelSchema,
  speed: z.number().min(0.5).max(1.5)
});

export const messageSchema = z.object({
  id: z.string().min(1).optional(),
  role: messageRoleSchema,
  content: z.string().min(1)
});

export const correctionSchema = z.object({
  original: z.string(),
  fixed: z.string(),
  short_reason: z.string()
});

export const vocabCandidateSchema = z.object({
  term: z.string(),
  reading: z.string().optional(),
  meaning: z.string(),
  example: z.string().optional()
});

export const vocabularyItemSchema = z.object({
  id: z.string().min(1).optional(),
  user_id: z.string().min(1),
  language: languageSchema,
  term: z.string().min(1),
  reading: z.string().optional(),
  meaning: z.string().min(1),
  source_message_id: z.string().optional(),
  created_at: z.date().optional(),
  deleted_at: z.date().nullable().optional()
});

export const reviewCardSchema = z.object({
  id: z.string().min(1).optional(),
  vocabulary_item_id: z.string().min(1),
  user_id: z.string().min(1),
  ease: z.number(),
  interval_days: z.number().int().nonnegative(),
  repetitions: z.number().int().nonnegative(),
  due_at: z.date()
});

export const providerConfigSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["llm", "stt", "tts"]),
  vendor: z.string().min(1),
  model: z.string().optional(),
  voice_id: z.string().optional(),
  api_key_encrypted: z.string().optional(),
  base_url: z.string().url().optional(),
  is_active: z.boolean(),
  role: z.enum(["primary", "fallback"])
});

export const apiSchemas = {
  createSessionRequest: z.object({
    target_language: languageSchema,
    level: levelSchema,
    speed: z.number().min(0.5).max(1.5),
    mode: z.literal("free_talk")
  }),
  createTurnRequest: z.object({
    session_id: z.string().min(1),
    audio_fixture: z.string().min(1)
  }),
  createTurnResponse: z.object({
    trace_id: z.string().min(1),
    user_text: z.string(),
    assistant_text: z.string(),
    audio_url: z.string().optional(),
    vocab_candidates: z.array(vocabCandidateSchema)
  }),
  saveVocabularyRequest: z.object({
    source_message_id: z.string().min(1),
    term: z.string().min(1),
    meaning: z.string().min(1),
    language: languageSchema
  }),
  gradeReviewRequest: z.object({
    review_card_id: z.string().min(1),
    grade: z.enum(["again", "hard", "good", "easy"])
  })
};

export type Language = z.infer<typeof languageSchema>;
export type Level = z.infer<typeof levelSchema>;
export type Message = z.infer<typeof messageSchema>;
export type Correction = z.infer<typeof correctionSchema>;
export type VocabCandidate = z.infer<typeof vocabCandidateSchema>;
export type VocabularyItem = z.infer<typeof vocabularyItemSchema>;
export type ReviewCard = z.infer<typeof reviewCardSchema>;
export type ProviderConfig = z.infer<typeof providerConfigSchema>;
