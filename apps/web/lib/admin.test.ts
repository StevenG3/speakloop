import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { PrismaClient } from "@prisma/client";
import { createTestPrismaClient } from "./test-db";
import { maskSecret } from "./auth";
import { createProviderConfig, getAdminMetrics, testProviderConnection, updateProviderConfig } from "./admin";
import { decryptSecret } from "./secrets";

describe("admin provider service", () => {
  let prisma: PrismaClient;
  let adminId: string;

  beforeEach(async () => {
    process.env.ENCRYPTION_KEY = "12345678901234567890123456789012";
    prisma = createTestPrismaClient("speakloop-admin-");
    const admin = await prisma.user.create({
      data: { email: "admin@speakloop.dev", password_hash: "hash", roles: { create: { role: "admin" } } }
    });
    adminId = admin.id;
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  it("stores provider keys encrypted and returns masked values", async () => {
    const config = await createProviderConfig(prisma, adminId, "llm", {
      vendor: "mock",
      model: "mock-chat",
      api_key: "sk-secret-9876",
      base_url: "https://mock.local",
      role: "primary",
      is_active: true
    });

    expect(config.api_key_masked).toBe(maskSecret("sk-secret-9876"));
    const raw = await prisma.aiProviderConfig.findUniqueOrThrow({ where: { id: config.id } });
    expect(raw.api_key_encrypted).not.toContain("sk-secret");
    expect(decryptSecret(raw.api_key_encrypted ?? "")).toBe("sk-secret-9876");
  });

  it("updates provider config and writes an audit log", async () => {
    const config = await createProviderConfig(prisma, adminId, "stt", {
      vendor: "mock",
      model: "mock-stt",
      role: "fallback",
      is_active: true
    });

    await updateProviderConfig(prisma, adminId, "stt", config.id, { model: "mock-stt-v2", api_key: "sk-new-9999" });

    await expect(prisma.auditLog.count({ where: { actor_user_id: adminId, action: "provider.update" } })).resolves.toBe(1);
    const raw = await prisma.sttProviderConfig.findUniqueOrThrow({ where: { id: config.id } });
    expect(raw.model).toBe("mock-stt-v2");
  });

  it("tests mock provider connections and aggregates metrics", async () => {
    const config = await createProviderConfig(prisma, adminId, "tts", {
      vendor: "mock",
      model: "mock-tts",
      voice_id: "alloy",
      role: "primary",
      is_active: true
    });

    const health = await testProviderConnection(prisma, adminId, "tts", config.id);
    expect(health.ok).toBe(true);
    expect(health.latency_ms).toBeGreaterThan(0);

    await prisma.providerRequestLog.create({
      data: { trace_id: "trace-admin", user_id: adminId, provider_kind: "tts", vendor: "mock", latency_ms: 42, status: "ok" }
    });

    await expect(getAdminMetrics(prisma)).resolves.toContainEqual({
      provider_kind: "tts",
      requests: 1,
      errors: 0,
      avg_latency_ms: 42
    });
  });
});
