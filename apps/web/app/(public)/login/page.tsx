import { getLoginRedirect } from "@/lib/public-flow";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ next?: string }> }) {
  const params = await searchParams;

  return <LoginForm redirectTo={getLoginRedirect(params?.next)} />;
}
