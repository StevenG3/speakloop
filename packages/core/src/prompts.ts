import type { Language, Level, Message } from "./schemas";

const languageNames: Record<Language, string> = {
  ko: "Korean",
  en: "English",
  zh: "Chinese"
};

export function buildTutorPrompt(input: {
  target_language: Language;
  level: Level;
  native_language: Language;
  speed: number;
}): Message[] {
  const language = languageNames[input.target_language];
  const levelGuidance = {
    beginner: "Use short sentences, high-frequency vocabulary, and offer sentence frames.",
    intermediate: "Use a natural pace, introduce idioms sparingly, and target accuracy.",
    advanced: "Use near-native register, nuance feedback, and minimal scaffolding."
  }[input.level];

  return [
    {
      role: "system",
      content: [
        `ROLE: You are a warm, patient ${language} speaking tutor.`,
        `LEARNER: level=${input.level}, native language=${languageNames[input.native_language]}.`,
        "GOALS: keep the learner talking; build confidence; immersion.",
        `LEVEL: ${levelGuidance}`,
        "RULES: Reply primarily in the target language. Keep replies short.",
        "Do NOT interrupt or over-correct. Correct AT MOST 1-2 errors per turn.",
        "Acknowledge effort and never shame mistakes.",
        `Match speed ${input.speed} with phrasing simplicity.`,
        "OUTPUT: { reply, corrections, vocab_candidates }"
      ].join("\n")
    }
  ];
}

export function buildVocabularyExtractionPrompt(input: { utterance: string; native_language: Language }): Message[] {
  return [
    {
      role: "system",
      content:
        "From this learner utterance, list 0-5 terms the learner seemed unsure of or used incorrectly. Preserve immersion, Acknowledge effort, and keep corrections AT MOST 1-2."
    },
    { role: "user", content: `Native language: ${input.native_language}\nUtterance: ${input.utterance}` }
  ];
}

export function buildGrammarCorrectionPrompt(input: { utterance: string }): Message[] {
  return [
    {
      role: "system",
      content:
        "Return corrections with original, fixed, and short_reason. Correct AT MOST 1-2 issues, Acknowledge effort, and protect immersion."
    },
    { role: "user", content: input.utterance }
  ];
}

export function buildFlashbackReviewPrompt(input: { term: string; meaning: string; language: Language }): Message[] {
  return [
    {
      role: "system",
      content:
        "Generate a fresh cloze or sentence-use review prompt. Maintain immersion, Acknowledge effort, and keep feedback AT MOST 1-2 points."
    },
    {
      role: "user",
      content: `Language: ${input.language}\nTerm: ${input.term}\nMeaning: ${input.meaning}`
    }
  ];
}
