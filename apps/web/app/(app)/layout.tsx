import type { ReactNode } from "react";
import { getRequestLocale } from "@/lib/locale";
import { AppLayoutFrame } from "./AppLayoutFrame";

export default async function AppLayout({ children }: { children: ReactNode }) {
  return <AppLayoutFrame locale={await getRequestLocale()}>{children}</AppLayoutFrame>;
}
