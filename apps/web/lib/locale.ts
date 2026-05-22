import { cookies } from "next/headers";
import { defaultLocale, parseLocale, type Locale } from "./i18n";

export const localeCookieName = "speakloop_locale";

export async function getRequestLocale(): Promise<Locale> {
  try {
    const store = await cookies();
    return parseLocale(store.get(localeCookieName)?.value);
  } catch {
    return defaultLocale;
  }
}
