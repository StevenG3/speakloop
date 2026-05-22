"use server";

import { signIn } from "@/lib/next-auth";
import { getLoginRedirect } from "@/lib/public-flow";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const redirectTo = getLoginRedirect(String(formData.get("redirectTo") ?? ""));

  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo
    });
  } catch (error) {
    if (isCredentialsError(error)) {
      const params = new URLSearchParams({ error: "invalid-credentials", next: redirectTo });
      redirect(`/login?${params.toString()}`);
    }

    throw error;
  }
}

function isCredentialsError(error: unknown) {
  return (
    error instanceof Error &&
    (error.message.includes("CredentialsSignin") || "type" in error && error.type === "CredentialsSignin")
  );
}
