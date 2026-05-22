import { redirect } from "next/navigation";
import { createPrismaClient } from "@/lib/db";
import { getAppSession } from "@/lib/session";
import { SettingsPanel } from "./SettingsPanel";

const prisma = createPrismaClient();

export default async function SettingsPage() {
  const session = await getAppSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const settings = await prisma.userSettings.findUnique({ where: { user_id: session.user.id } });

  return (
    <SettingsPanel
      profile={{
        email: session.user.email ?? "Unknown user",
        targetLanguage: settings?.target_language ?? "ko",
        level: settings?.level ?? "beginner",
        defaultSpeed: settings?.default_speed ?? 1,
        theme: settings?.theme ?? "system"
      }}
    />
  );
}
