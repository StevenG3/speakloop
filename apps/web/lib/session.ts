import { cookies } from "next/headers";
import { auth } from "./next-auth";

export type AppSession = {
  user?: {
    id?: string;
    email?: string | null;
    role?: string;
  };
} | null;

export async function getAppSession(): Promise<AppSession> {
  const nextAuthSession = await auth();
  if (nextAuthSession?.user?.id) {
    return nextAuthSession;
  }

  const cookieStore = await cookies();
  const id = cookieStore.get("speakloop_user_id")?.value;
  if (!id) {
    return null;
  }

  return {
    user: {
      id,
      email: cookieStore.get("speakloop_user_email")?.value ?? null,
      role: cookieStore.get("speakloop_user_role")?.value ?? "user"
    }
  };
}

export async function setAppSessionCookie(user: { id: string; email: string | null; role: string }) {
  const cookieStore = await cookies();
  const options = { httpOnly: true, sameSite: "lax" as const, path: "/" };
  cookieStore.set("speakloop_user_id", user.id, options);
  cookieStore.set("speakloop_user_email", user.email ?? "", options);
  cookieStore.set("speakloop_user_role", user.role, options);
}
