import { getAppSession } from "@/lib/session";
import { createProviderConfig, listProviderConfigs, type ProviderKind } from "@/lib/admin";
import { createPrismaClient } from "@/lib/db";

const prisma = createPrismaClient();

export async function GET() {
  const session = await getAppSession();
  if (session?.user?.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  return Response.json(await listProviderConfigs(prisma));
}

export async function POST(request: Request) {
  const session = await getAppSession();
  if (session?.user?.role !== "admin" || !session.user.id) {
    return new Response("Forbidden", { status: 403 });
  }

  const body = await request.json();
  const config = await createProviderConfig(prisma, session.user.id, body.kind as ProviderKind, body);
  return Response.json(config);
}
