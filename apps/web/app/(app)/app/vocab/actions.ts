"use server";

import { revalidatePath } from "next/cache";
import { getAppSession } from "@/lib/session";
import { createPrismaClient } from "@/lib/db";
import { saveVocabularyFromSession, softDeleteVocabularyItem } from "@/lib/vocab";

const prisma = createPrismaClient();

export async function saveVocabularyAction(formData: FormData) {
  const session = await getAppSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await saveVocabularyFromSession(prisma, session.user.id, {
    language: String(formData.get("language") ?? "en") as "ko" | "en" | "zh",
    term: String(formData.get("term") ?? ""),
    reading: String(formData.get("reading") ?? "") || null,
    meaning: String(formData.get("meaning") ?? ""),
    source_message_id: String(formData.get("source_message_id") ?? "") || null,
    examples: [{ sentence: String(formData.get("example") ?? ""), translation: String(formData.get("translation") ?? "") || null }]
  });
  revalidatePath("/app/vocab");
}

export async function deleteVocabularyAction(formData: FormData) {
  const session = await getAppSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await softDeleteVocabularyItem(prisma, session.user.id, String(formData.get("id")));
  revalidatePath("/app/vocab");
}
