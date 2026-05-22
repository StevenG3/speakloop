"use client";

import React from "react";
import { useState } from "react";
import { Badge, Button, Card } from "@/components/ui";

export type ProviderAdminConfig = {
  id: string;
  kind: "llm" | "stt" | "tts";
  vendor: string;
  model?: string | null;
  voice_id?: string | null;
  voice_gender?: string | null;
  api_key_masked: string;
  base_url?: string | null;
  role: "primary" | "fallback";
  is_active: boolean;
  last_health?: string | null;
  last_latency_ms?: number | null;
};

const kindLabels = { llm: "LLM", stt: "STT", tts: "TTS" };

export function ProviderAdmin({ configs }: { configs: ProviderAdminConfig[] }) {
  const [tested, setTested] = useState<string | null>(null);

  return (
    <main className="mx-auto grid max-w-5xl gap-6 p-4 text-[var(--text)]">
      <header>
        <h1 className="text-2xl font-bold">Provider Config</h1>
        <p className="text-sm text-[var(--text-muted)]">Mock-ready provider settings for Phase 1.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {configs.map((config) => (
          <Card key={config.id} className="grid gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{kindLabels[config.kind]}</h2>
                <p className="text-sm text-[var(--text-muted)]">{config.vendor}</p>
              </div>
              <Badge>{config.role}</Badge>
            </div>
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--text-muted)]">Model</dt>
                <dd>{config.model ?? config.voice_id ?? "mock"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--text-muted)]">API key</dt>
                <dd>{config.api_key_masked || "not set"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--text-muted)]">Health</dt>
                <dd>{config.last_health ?? "unknown"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--text-muted)]">Latency</dt>
                <dd>{config.last_latency_ms ? `${config.last_latency_ms} ms` : "not tested"}</dd>
              </div>
            </dl>
            <Button
              type="button"
              variant="secondary"
              aria-label={`Test ${kindLabels[config.kind]} connection`}
              onClick={() => void testConnection(config, setTested)}
            >
              Test connection
            </Button>
            {tested === config.id ? <p className="text-sm text-[var(--success)]">Connection ok</p> : null}
          </Card>
        ))}
      </div>
    </main>
  );
}

async function testConnection(config: ProviderAdminConfig, onDone: (id: string) => void) {
  await fetch(`/api/admin/providers/${config.kind}/${config.id}/test`, { method: "POST" });
  onDone(config.id);
}
