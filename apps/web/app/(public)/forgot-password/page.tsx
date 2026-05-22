import { getRequestLocale } from "@/lib/locale";
import { ForgotPasswordPageView } from "./ForgotPasswordPageView";

export default async function ForgotPasswordPage({ searchParams }: { searchParams?: Promise<{ sent?: string; resetLink?: string }> }) {
  const params = await searchParams;
  const locale = await getRequestLocale();
  const resetLink = params?.resetLink ? decodeURIComponent(params.resetLink) : undefined;

  if (resetLink) {
    return <ForgotPasswordPageView locale={locale} sent={params?.sent === "1"} resetLink={resetLink} />;
  }

  return <ForgotPasswordPageView locale={locale} sent={params?.sent === "1"} />;
}
