import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getAppSession();

  if (session?.user?.role !== "admin") {
    redirect("/app");
  }

  return <>{children}</>;
}
