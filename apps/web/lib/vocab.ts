import type { Language, PrismaClient } from "@prisma/client";

export type SaveVocabularyInput = {
  language: Language;
  term: string;
  reading?: string | null;
  meaning: string;
  source_message_id?: string | null;
  examples: Array<{ sentence: string; translation?: string | null }>;
};

export async function saveVocabularyFromSession(prisma: PrismaClient, userId: string, input: SaveVocabularyInput) {
  return prisma.vocabularyItem.create({
    data: {
      user_id: userId,
      language: input.language,
      term: input.term.trim(),
      reading: input.reading?.trim() || null,
      meaning: input.meaning.trim(),
      source_message_id: input.source_message_id ?? null,
      examples: {
        create: input.examples
          .filter((example) => example.sentence.trim().length > 0)
          .map((example) => ({ sentence: example.sentence.trim(), translation: example.translation?.trim() || null }))
      },
      review_card: {
        create: {
          user_id: userId,
          ease: 2.5,
          interval_days: 0,
          repetitions: 0,
          due_at: new Date()
        }
      }
    },
    include: { examples: true, review_card: true }
  });
}

export async function softDeleteVocabularyItem(prisma: PrismaClient, userId: string, id: string) {
  return prisma.vocabularyItem.update({
    where: { id, user_id: userId },
    data: { deleted_at: new Date() }
  });
}

export async function listVocabularyBook(prisma: PrismaClient, userId: string, query = "") {
  const term = query.trim();

  return prisma.vocabularyItem.findMany({
    where: {
      user_id: userId,
      deleted_at: null,
      ...(term
        ? {
            OR: [
              { term: { contains: term } },
              { meaning: { contains: term } },
              { reading: { contains: term } }
            ]
          }
        : {})
    },
    orderBy: [{ language: "asc" }, { created_at: "desc" }],
    include: { examples: true, source_message: true }
  });
}

export function groupVocabularyByLanguage(items: Awaited<ReturnType<typeof listVocabularyBook>>) {
  return items.reduce<Record<Language, typeof items>>(
    (groups, item) => {
      groups[item.language].push(item);
      return groups;
    },
    { ko: [], en: [], zh: [] }
  );
}
