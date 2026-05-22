"use server";

import { revalidatePath } from "next/cache";
import { getAppSession } from "@/lib/session";
import { createPrismaClient } from "@/lib/db";
import { gradeReviewCard } from "@/lib/review";

const prisma = createPrismaClient();

export async function gradeReviewAction(formData: FormData) {
  const session = await getAppSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await gradeReviewCard(prisma, session.user.id, String(formData.get("card_id")), String(formData.get("grade")) as never);
  revalidatePath("/app/review");
}
