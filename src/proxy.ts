import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import {
  AUTH_ROUTES,
  PATIENT_ROUTE_PREFIX,
  PSYCHOLOGIST_ROUTE_PREFIX,
  ROUTES,
} from "@/lib/routes";

const PROTECTED_ROUTE_PREFIXES = [
  PSYCHOLOGIST_ROUTE_PREFIX,
  PATIENT_ROUTE_PREFIX,
] as const;

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(getSessionCookie(request));
  const isProtectedRoute = PROTECTED_ROUTE_PREFIXES.some((prefix) =>
    matchesPrefix(pathname, prefix),
  );
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    matchesPrefix(pathname, route),
  );

  if (isProtectedRoute && !hasSessionCookie) {
    return NextResponse.redirect(new URL(ROUTES.login, request.url));
  }

  if (isAuthRoute && hasSessionCookie) {
    return NextResponse.redirect(new URL(ROUTES.home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
