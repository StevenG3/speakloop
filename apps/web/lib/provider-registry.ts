import {
  MockLLM,
  MockSTT,
  MockTTS,
  resolveProviderPair,
  type LLMProvider,
  type LLMResponse,
  type ProviderHealth,
  type STTProvider,
  type STTRequest,
  type STTResponse,
  type TTSProvider,
  type TTSRequest,
  type TTSResponse
} from "@speakloop/core";
import type { PrismaClient } from "@prisma/client";

export type ResolvedProviders = {
  stt: STTProvider;
  llm: LLMProvider;
  tts: TTSProvider;
};

export async function resolveProviders(prisma: PrismaClient): Promise<ResolvedProviders> {
  const mockProviders = process.env.MOCK_PROVIDERS !== "false";
  const [llmConfigs, sttConfigs, ttsConfigs] = await Promise.all([
    prisma.aiProviderConfig.findMany({ where: { is_active: true }, orderBy: { updated_at: "desc" } }),
    prisma.sttProviderConfig.findMany({ where: { is_active: true }, orderBy: { updated_at: "desc" } }),
    prisma.ttsProviderConfig.findMany({ where: { is_active: true }, orderBy: { updated_at: "desc" } })
  ]);

  const llmPrimary = llmConfigs.find((config) => config.role === "primary");
  const llmFallback = llmConfigs.find((config) => config.role === "fallback");
  const sttPrimary = sttConfigs.find((config) => config.role === "primary");
  const sttFallback = sttConfigs.find((config) => config.role === "fallback");
  const ttsPrimary = ttsConfigs.find((config) => config.role === "primary");
  const ttsFallback = ttsConfigs.find((config) => config.role === "fallback");

  return {
    llm: resolveProviderPair({
      primary: llmPrimary ? buildLlmProvider(llmPrimary.vendor) : new MockLLM(),
      fallback: llmFallback ? buildLlmProvider(llmFallback.vendor) : new MockLLM("mock-llm-fallback"),
      mockProviders
    }),
    stt: resolveProviderPair({
      primary: sttPrimary ? buildSttProvider(sttPrimary.vendor) : new MockSTT(),
      fallback: sttFallback ? buildSttProvider(sttFallback.vendor) : new ConfiguredMockSTT("mock-stt-fallback"),
      mockProviders
    }),
    tts: resolveProviderPair({
      primary: ttsPrimary ? buildTtsProvider(ttsPrimary.vendor) : new MockTTS(),
      fallback: ttsFallback ? buildTtsProvider(ttsFallback.vendor) : new ConfiguredMockTTS("mock-tts-fallback"),
      mockProviders
    })
  };
}

function buildLlmProvider(id: string): LLMProvider {
  return id === "fail-mock" ? new FailingLLM(id) : new MockLLM(id);
}

function buildSttProvider(id: string): STTProvider {
  return id === "fail-mock" ? new FailingSTT(id) : new ConfiguredMockSTT(id);
}

function buildTtsProvider(id: string): TTSProvider {
  return id === "fail-mock" ? new FailingTTS(id) : new ConfiguredMockTTS(id);
}

class ConfiguredMockSTT implements STTProvider {
  private readonly mock = new MockSTT();

  constructor(readonly id: string) {}

  async transcribe(input: STTRequest): Promise<STTResponse> {
    const result = await this.mock.transcribe(input);
    return { ...result, provider_id: this.id };
  }

  async testConnection(): Promise<ProviderHealth> {
    return { ok: true, latency_ms: 1 };
  }
}

class ConfiguredMockTTS implements TTSProvider {
  private readonly mock = new MockTTS();

  constructor(readonly id: string) {}

  async synthesize(input: TTSRequest): Promise<TTSResponse> {
    const result = await this.mock.synthesize(input);
    return { ...result, provider_id: this.id };
  }

  async testConnection(): Promise<ProviderHealth> {
    return { ok: true, latency_ms: 1 };
  }
}

class FailingLLM implements LLMProvider {
  constructor(readonly id: string) {}

  async generateReply(): Promise<LLMResponse> {
    throw new Error("configured provider failed");
  }

  async testConnection(): Promise<ProviderHealth> {
    return { ok: false, latency_ms: 1, error: "configured provider failed" };
  }
}

class FailingSTT implements STTProvider {
  constructor(readonly id: string) {}

  async transcribe(): Promise<STTResponse> {
    throw new Error("configured provider failed");
  }

  async testConnection(): Promise<ProviderHealth> {
    return { ok: false, latency_ms: 1, error: "configured provider failed" };
  }
}

class FailingTTS implements TTSProvider {
  constructor(readonly id: string) {}

  async synthesize(): Promise<TTSResponse> {
    throw new Error("configured provider failed");
  }

  async testConnection(): Promise<ProviderHealth> {
    return { ok: false, latency_ms: 1, error: "configured provider failed" };
  }
}
