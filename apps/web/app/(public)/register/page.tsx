import { getRequestLocale } from "@/lib/locale";
import { RegisterPageView } from "./RegisterPageView";

export default async function RegisterPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const error = params?.error === "email-registered" ? "email-registered" : undefined;
  const locale = await getRequestLocale();

  return error ? <RegisterPageView locale={locale} error={error} /> : <RegisterPageView locale={locale} />;
}
