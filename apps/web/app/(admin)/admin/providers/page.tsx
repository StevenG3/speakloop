import { createPrismaClient } from "@/lib/db";
import { listProviderConfigs } from "@/lib/admin";
import { ProviderAdmin } from "./ProviderAdmin";

const prisma = createPrismaClient();

export default async function ProvidersPage() {
  const configs = await listProviderConfigs(prisma);

  return <ProviderAdmin configs={configs} />;
}
