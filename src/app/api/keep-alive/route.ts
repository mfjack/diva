import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { serverEnv } from "@/lib/server-env";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function isAuthorizedCron(request: NextRequest): boolean {
  const { CRON_SECRET } = serverEnv;
  if (!CRON_SECRET) return false;
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${CRON_SECRET}`);
  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return new Response(null, { status: 401 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  return new Response(null, { status: error ? 503 : 204 });
}
