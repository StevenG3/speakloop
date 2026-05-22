import { requireAdminApi } from "@/lib/auth";
import { getAppSession } from "@/lib/session";

export async function GET() {
  const guard = await requireAdminApi(await getAppSession());
  if (guard.status !== 200) {
    return guard;
  }

  return Response.json({ ok: true });
}
