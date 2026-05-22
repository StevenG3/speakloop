"use server";

import { cookies } from "next/headers";
import { parseLocale } from "@/lib/i18n";
import { localeCookieName } from "@/lib/locale";

export async function setLocaleAction(formData: FormData) {
  const locale = parseLocale(String(formData.get("locale") ?? ""));
  const store = await cookies();

  store.set(localeCookieName, locale, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });
}
