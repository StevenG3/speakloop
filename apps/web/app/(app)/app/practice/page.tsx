import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/session";
import { createPrismaClient } from "@/lib/db";
import { PracticeSetup } from "./PracticeSetup";

const prisma = createPrismaClient();

export default async function PracticePage() {
  const session = await getAppSession();
  if (!session?.user?.id) {
    redirect("/login?next=/app/practice");
  }

  const settings = await prisma.userSettings.findUnique({ where: { user_id: session.user.id } });

  return <PracticeSetup defaultSpeed={settings?.default_speed ?? 1} />;
}
