import { getAppSession } from "@/lib/session";
import { testProviderConnection, type ProviderKind } from "@/lib/admin";
import { createPrismaClient } from "@/lib/db";

const prisma = createPrismaClient();

export async function POST(_request: Request, { params }: { params: Promise<{ kind: string; id: string }> }) {
  const session = await getAppSession();
  if (session?.user?.role !== "admin" || !session.user.id) {
    return new Response("Forbidden", { status: 403 });
  }

  const { kind, id } = await params;
  if (kind !== "llm" && kind !== "stt" && kind !== "tts") {
    return new Response("Invalid provider kind", { status: 400 });
  }

  return Response.json(await testProviderConnection(prisma, session.user.id, kind as ProviderKind, id));
}
