import { getAppSession } from "@/lib/session";
import { createPrismaClient } from "@/lib/db";
import { handleMockTurn, normalizeTurnBody } from "@/lib/turn";

const prisma = createPrismaClient();

export async function POST(request: Request) {
  const session = await getAppSession();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = normalizeTurnBody(await request.json());
    const result = await handleMockTurn(prisma, { ...body, user_id: session.user.id });
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Turn failed" },
      { status: 400 }
    );
  }
}
