import { getRequestLocale } from "@/lib/locale";
import { ForgotPasswordPageView } from "./ForgotPasswordPageView";

export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams?: Promise<{ sent?: string; resetLink?: string; error?: string }>;
}) {
  const params = await searchParams;
  const locale = await getRequestLocale();
  const resetLink = params?.resetLink ? decodeURIComponent(params.resetLink) : undefined;
  const error = params?.error === "try-again" ? "try-again" : undefined;

  if (resetLink && error) {
    return <ForgotPasswordPageView locale={locale} sent={params?.sent === "1"} resetLink={resetLink} error={error} />;
  }

  if (resetLink) {
    return <ForgotPasswordPageView locale={locale} sent={params?.sent === "1"} resetLink={resetLink} />;
  }

  if (error) {
    return <ForgotPasswordPageView locale={locale} sent={params?.sent === "1"} error={error} />;
  }

  return <ForgotPasswordPageView locale={locale} sent={params?.sent === "1"} />;
}
