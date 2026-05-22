import { getAppSession } from "@/lib/session";
import { createPrismaClient } from "@/lib/db";
import { gradeReviewCard } from "@/lib/review";

const prisma = createPrismaClient();

export async function POST(request: Request) {
  const session = await getAppSession();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const card = await gradeReviewCard(prisma, session.user.id, body.card_id, body.grade);
  return Response.json({ id: card.id, interval_days: card.interval_days });
}
