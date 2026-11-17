import { type NextRequest, NextResponse } from "next/server";
import { LOGIN_ERROR_CODES, ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

const LOGIN_ERROR_CODE_VALUES = new Set<string>(
  Object.values(LOGIN_ERROR_CODES),
);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const errorCode = searchParams.get("error");
  const supabase = await createClient();
  await supabase.auth.signOut();

  const loginUrl = new URL(ROUTES.login, origin);
  if (errorCode && LOGIN_ERROR_CODE_VALUES.has(errorCode)) {
    loginUrl.searchParams.set("error", errorCode);
  }
  return NextResponse.redirect(loginUrl);
}
