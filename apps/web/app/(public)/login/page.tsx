import { getLoginRedirect } from "@/lib/public-flow";
import { getRequestLocale } from "@/lib/locale";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ next?: string; error?: string; reset?: string }> }) {
  const params = await searchParams;
  const locale = await getRequestLocale();
  const redirectTo = getLoginRedirect(params?.next);
  const error = params?.error === "invalid-credentials" ? "invalid-credentials" : undefined;
  const reset = params?.reset === "success" ? "success" : undefined;

  if (error && reset) {
    return <LoginForm redirectTo={redirectTo} locale={locale} error={error} reset={reset} />;
  }

  if (error) {
    return <LoginForm redirectTo={redirectTo} locale={locale} error={error} />;
  }

  if (reset) {
    return <LoginForm redirectTo={redirectTo} locale={locale} reset={reset} />;
  }

  return <LoginForm redirectTo={redirectTo} locale={locale} />;
}
