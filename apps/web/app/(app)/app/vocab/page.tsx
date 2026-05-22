import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/session";
import { createPrismaClient } from "@/lib/db";
import { listVocabularyBook } from "@/lib/vocab";
import { VocabBook } from "./VocabBook";

const prisma = createPrismaClient();

export default async function VocabPage() {
  const session = await getAppSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const items = await listVocabularyBook(prisma, session.user.id);

  return (
    <VocabBook
      items={items.map((item) => ({
        id: item.id,
        language: item.language,
        term: item.term,
        reading: item.reading,
        meaning: item.meaning,
        sourceMessageId: item.source_message_id,
        examples: item.examples
      }))}
    />
  );
}
