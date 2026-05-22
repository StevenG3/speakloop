import { getRequestLocale } from "@/lib/locale";
import { ResetPasswordPageView } from "./ResetPasswordPageView";

export default async function ResetPasswordPage({ searchParams }: { searchParams?: Promise<{ token?: string; error?: string }> }) {
  const params = await searchParams;
  const locale = await getRequestLocale();
  const error = params?.error === "invalid" ? "invalid" : undefined;
  const token = params?.token ?? "";

  return error ? <ResetPasswordPageView locale={locale} token={token} error={error} /> : <ResetPasswordPageView locale={locale} token={token} />;
}
