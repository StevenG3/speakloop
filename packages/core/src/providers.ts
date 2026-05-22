import type { Correction, Language, Level, Message, VocabCandidate } from "./schemas";

export type ProviderHealth = {
  ok: boolean;
  latency_ms: number;
  error?: string;
};

export type LLMRequest = {
  messages: Message[];
  target_language: Language;
  level: Level;
};

export type LLMResponse = {
  provider_id: string;
  reply: string;
  corrections: Correction[];
  vocab_candidates: VocabCandidate[];
};

export type STTRequest = {
  audio_fixture: string;
  language: Language;
};

export type STTResponse = {
  provider_id: string;
  text: string;
  confidence: number;
};

export type TTSRequest = {
  text: string;
  language: Language;
  speed: number;
};

export type TTSResponse = {
  provider_id: string;
  audio_url: string;
  voice_id: string;
};

export interface LLMProvider {
  readonly id: string;
  generateReply(input: LLMRequest): Promise<LLMResponse>;
  testConnection(): Promise<ProviderHealth>;
}

export interface STTProvider {
  readonly id: string;
  transcribe(input: STTRequest): Promise<STTResponse>;
  testConnection(): Promise<ProviderHealth>;
}

export interface TTSProvider {
  readonly id: string;
  synthesize(input: TTSRequest): Promise<TTSResponse>;
  testConnection(): Promise<ProviderHealth>;
}

export class MockLLM implements LLMProvider {
  constructor(readonly id = "mock-llm") {}

  async generateReply(input: LLMRequest): Promise<LLMResponse> {
    const lastUserMessage = [...input.messages].reverse().find((message) => message.role === "user");
    const text = lastUserMessage?.content ?? "";

    return {
      provider_id: this.id,
      reply: `I heard you say: "${text}". Nice effort. What would you like to say next?`,
      corrections: [
        {
          original: text,
          fixed: text.replace("goed", "went").replace("go school", "went to school"),
          short_reason: "Use a natural past-tense form here."
        }
      ],
      vocab_candidates: [
        {
          term: input.target_language === "ko" ? "연습" : "practice",
          reading: input.target_language === "ko" ? "yeonseup" : undefined,
          meaning: "focused repetition",
          example: "A little practice every day helps."
        }
      ]
    };
  }

  async testConnection(): Promise<ProviderHealth> {
    return { ok: true, latency_ms: 1 };
  }
}

export class MockSTT implements STTProvider {
  readonly id = "mock-stt";

  async transcribe(input: STTRequest): Promise<STTResponse> {
    const transcripts: Record<string, string> = {
      "hello-ko.wav": "안녕하세요. 오늘 연습하고 싶어요.",
      "hello-en.wav": "Hello, I want to practice today.",
      "hello-zh.wav": "你好，我今天想练习。"
    };

    return {
      provider_id: this.id,
      text: transcripts[input.audio_fixture] ?? "Hello, I want to practice speaking.",
      confidence: 0.98
    };
  }

  async testConnection(): Promise<ProviderHealth> {
    return { ok: true, latency_ms: 1 };
  }
}

export class MockTTS implements TTSProvider {
  readonly id = "mock-tts";

  async synthesize(input: TTSRequest): Promise<TTSResponse> {
    void input;
    return {
      provider_id: this.id,
      audio_url: "/fixtures/audio/tts-mock.wav",
      voice_id: "mock-voice"
    };
  }

  async testConnection(): Promise<ProviderHealth> {
    return { ok: true, latency_ms: 1 };
  }
}

export function resolveProviderPair<TProvider extends { testConnection(): Promise<ProviderHealth> }>(options: {
  primary: TProvider;
  fallback?: TProvider;
  mockProviders: boolean;
}): TProvider {
  const { primary, fallback } = options;

  return new Proxy(primary, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver);

      if (typeof value !== "function" || property === "testConnection" || !fallback) {
        return value;
      }

      return async (...args: unknown[]) => {
        try {
          return await value.apply(target, args);
        } catch (error) {
          const fallbackMethod = Reflect.get(fallback, property, fallback);
          if (typeof fallbackMethod !== "function") {
            throw error;
          }
          return fallbackMethod.apply(fallback, args);
        }
      };
    }
  });
}
