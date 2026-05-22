import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/session";
import { createPrismaClient } from "@/lib/db";
import { getDashboardData } from "@/lib/dashboard";
import { Dashboard } from "./Dashboard";

const prisma = createPrismaClient();

export default async function AppDashboardPage() {
  const session = await getAppSession();
  if (!session?.user?.id) {
    redirect("/login?next=/app");
  }

  const data = await getDashboardData(prisma, session.user.id);

  return <Dashboard {...data} />;
}
