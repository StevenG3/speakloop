import { getAppSession } from "@/lib/session";
import { createPrismaClient } from "@/lib/db";
import { saveVocabularyFromSession, softDeleteVocabularyItem } from "@/lib/vocab";

const prisma = createPrismaClient();

export async function POST(request: Request) {
  const session = await getAppSession();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const vocab = await saveVocabularyFromSession(prisma, session.user.id, {
    language: body.language,
    term: body.term,
    reading: body.reading ?? null,
    meaning: body.meaning,
    source_message_id: body.source_message_id ?? null,
    examples: body.examples ?? []
  });

  return Response.json({ id: vocab.id });
}

export async function DELETE(request: Request) {
  const session = await getAppSession();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  await softDeleteVocabularyItem(prisma, session.user.id, body.id);
  return Response.json({ ok: true });
}
