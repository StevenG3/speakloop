import { Card } from "@/components/ui";
import { validateEnv } from "@/lib/env";

export default function DiagnosticsPage() {
  const env = validateEnv(process.env);

  return (
    <main className="mx-auto grid max-w-5xl gap-6 p-4 text-[var(--text)]">
      <h1 className="text-2xl font-bold">Diagnostics</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Provider health</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Mock providers enabled: {String(env.MOCK_PROVIDERS)}</p>
        </Card>
        <Card>
          <h2 className="font-semibold">Prompt preview</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Free-talk prompt with gentle correction and 1-2 vocabulary items.</p>
        </Card>
        <Card>
          <h2 className="font-semibold">Feature flags</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">free-talk=true streaming=false pronunciation=false</p>
        </Card>
        <Card>
          <h2 className="font-semibold">Audio inspector</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Recording fixtures are routed through MockSTT.</p>
        </Card>
      </div>
    </main>
  );
}
