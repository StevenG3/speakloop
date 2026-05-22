import { Card } from "@/components/ui";
import { getAdminMetrics } from "@/lib/admin";
import { createPrismaClient } from "@/lib/db";

const prisma = createPrismaClient();

export default async function MetricsPage() {
  const metrics = await getAdminMetrics(prisma);

  return (
    <main className="mx-auto grid max-w-5xl gap-6 p-4 text-[var(--text)]">
      <h1 className="text-2xl font-bold">Provider Metrics</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.provider_kind}>
            <h2 className="text-lg font-semibold">{metric.provider_kind.toUpperCase()}</h2>
            <p className="mt-3 text-sm text-[var(--text-muted)]">Requests: {metric.requests}</p>
            <p className="text-sm text-[var(--text-muted)]">Errors: {metric.errors}</p>
            <p className="text-sm text-[var(--text-muted)]">Avg latency: {metric.avg_latency_ms} ms</p>
          </Card>
        ))}
      </div>
    </main>
  );
}
