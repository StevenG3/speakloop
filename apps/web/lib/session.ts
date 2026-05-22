import { auth } from "./next-auth";

export type AppSession = {
  user?: {
    id?: string;
    email?: string | null;
    role?: string;
  };
} | null;

export async function getAppSession(): Promise<AppSession> {
  return auth();
}
