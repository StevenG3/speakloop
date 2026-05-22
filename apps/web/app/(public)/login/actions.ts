"use server";

import { signIn } from "@/lib/next-auth";
import { getLoginRedirect } from "@/lib/public-flow";

export async function loginAction(formData: FormData) {
  await signIn("credentials", {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    redirectTo: getLoginRedirect(String(formData.get("redirectTo") ?? ""))
  });
}
