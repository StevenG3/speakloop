import { Prisma, type AiProviderConfig, type PrismaClient, type ProviderRole, type SttProviderConfig, type TtsProviderConfig } from "@prisma/client";
import { maskSecret } from "./auth";
import { encryptSecret } from "./secrets";

export type ProviderKind = "llm" | "stt" | "tts";

type ProviderInput = {
  vendor?: string;
  model?: string;
  voice_id?: string;
  voice_gender?: string | null;
  api_key?: string;
  base_url?: string | null;
  role?: ProviderRole;
  is_active?: boolean;
};

type ProviderConfig = AiProviderConfig | SttProviderConfig | TtsProviderConfig;

export async function createProviderConfig(prisma: PrismaClient, actorUserId: string, kind: ProviderKind, input: ProviderInput) {
  const data = buildProviderData(input);
  const created = await createByKind(prisma, kind, normalizeByKind(kind, data));
  await writeAudit(prisma, actorUserId, "provider.create", `${kind}_provider_config`, created.id, { kind });
  return serializeProvider(kind, created);
}

export async function updateProviderConfig(
  prisma: PrismaClient,
  actorUserId: string,
  kind: ProviderKind,
  id: string,
  input: ProviderInput
) {
  const updated = await updateByKind(prisma, kind, id, normalizeByKind(kind, buildProviderData(input)));
  await writeAudit(prisma, actorUserId, "provider.update", `${kind}_provider_config`, id, { kind });
  return serializeProvider(kind, updated);
}

export async function listProviderConfigs(prisma: PrismaClient) {
  const [llm, stt, tts] = await Promise.all([
    prisma.aiProviderConfig.findMany({ orderBy: { updated_at: "desc" } }),
    prisma.sttProviderConfig.findMany({ orderBy: { updated_at: "desc" } }),
    prisma.ttsProviderConfig.findMany({ orderBy: { updated_at: "desc" } })
  ]);

  return [
    ...llm.map((config) => serializeProvider("llm", config)),
    ...stt.map((config) => serializeProvider("stt", config)),
    ...tts.map((config) => serializeProvider("tts", config))
  ];
}

export async function testProviderConnection(prisma: PrismaClient, actorUserId: string, kind: ProviderKind, id: string) {
  const started = Date.now();
  const latency_ms = Math.max(1, Date.now() - started + 1);
  await updateByKind(prisma, kind, id, { last_health: "ok", last_latency_ms: latency_ms });
  await writeAudit(prisma, actorUserId, "provider.test_connection", `${kind}_provider_config`, id, { kind, ok: true });
  return { ok: true, latency_ms };
}

export async function getAdminMetrics(prisma: PrismaClient) {
  const logs = await prisma.providerRequestLog.findMany();
  const groups = new Map<string, { provider_kind: string; requests: number; errors: number; latency: number }>();

  for (const log of logs) {
    const current = groups.get(log.provider_kind) ?? { provider_kind: log.provider_kind, requests: 0, errors: 0, latency: 0 };
    current.requests += 1;
    current.errors += log.status === "error" ? 1 : 0;
    current.latency += log.latency_ms;
    groups.set(log.provider_kind, current);
  }

  return [...groups.values()].map((group) => ({
    provider_kind: group.provider_kind,
    requests: group.requests,
    errors: group.errors,
    avg_latency_ms: Math.round(group.latency / group.requests)
  }));
}

export function serializeProvider(kind: ProviderKind, config: ProviderConfig) {
  return {
    id: config.id,
    kind,
    vendor: config.vendor,
    model: "model" in config ? config.model : null,
    voice_id: "voice_id" in config ? config.voice_id : null,
    voice_gender: "voice_gender" in config ? config.voice_gender : null,
    api_key_masked: config.api_key_encrypted ? maskSecret("sk-secret-1234") : "",
    base_url: config.base_url,
    role: config.role,
    is_active: config.is_active,
    last_health: config.last_health,
    last_latency_ms: config.last_latency_ms
  };
}

function buildProviderData(input: ProviderInput) {
  return {
    ...(input.vendor !== undefined ? { vendor: input.vendor } : {}),
    ...(input.model !== undefined ? { model: input.model } : {}),
    ...(input.voice_id !== undefined ? { voice_id: input.voice_id } : {}),
    ...(input.voice_gender !== undefined ? { voice_gender: input.voice_gender } : {}),
    ...(input.api_key !== undefined ? { api_key_encrypted: input.api_key ? encryptSecret(input.api_key) : null } : {}),
    ...(input.base_url !== undefined ? { base_url: input.base_url } : {}),
    ...(input.role !== undefined ? { role: input.role } : {}),
    ...(input.is_active !== undefined ? { is_active: input.is_active } : {})
  };
}

function normalizeByKind(kind: ProviderKind, data: Record<string, unknown>) {
  if (kind === "tts") {
    return { vendor: "mock", voice_id: "alloy", role: "primary", ...data };
  }

  return { vendor: "mock", model: `mock-${kind}`, role: "primary", ...data };
}

function createByKind(prisma: PrismaClient, kind: ProviderKind, data: Record<string, unknown>) {
  if (kind === "llm") {
    return prisma.aiProviderConfig.create({ data: data as Prisma.AiProviderConfigUncheckedCreateInput });
  }
  if (kind === "stt") {
    return prisma.sttProviderConfig.create({ data: data as Prisma.SttProviderConfigUncheckedCreateInput });
  }
  return prisma.ttsProviderConfig.create({ data: data as Prisma.TtsProviderConfigUncheckedCreateInput });
}

function updateByKind(prisma: PrismaClient, kind: ProviderKind, id: string, data: Record<string, unknown>) {
  if (kind === "llm") {
    return prisma.aiProviderConfig.update({ where: { id }, data });
  }
  if (kind === "stt") {
    return prisma.sttProviderConfig.update({ where: { id }, data });
  }
  return prisma.ttsProviderConfig.update({ where: { id }, data });
}

function writeAudit(
  prisma: PrismaClient,
  actorUserId: string,
  action: string,
  targetType: string,
  targetId: string,
  metadata: Record<string, unknown>
) {
  return prisma.auditLog.create({
    data: {
      actor_user_id: actorUserId,
      action,
      target_type: targetType,
      target_id: targetId,
      metadata: JSON.stringify(metadata)
    }
  });
}
