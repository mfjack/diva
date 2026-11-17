import "server-only";

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { actionFailure } from "@/lib/action-result";
import { isMockAuth } from "@/lib/auth-mode";
import { env } from "@/lib/env";
import { AUTH_ROUTES, PUBLIC_ROUTES, ROUTES } from "@/lib/routes";
import type { Database } from "./database.types";

const API_PATH_PREFIX = "/api/";
const SESSION_EXPIRED_MESSAGE = "Sua sessão expirou. Entre novamente.";

function matchesAnyRoute(pathname: string, routes: readonly string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function buildLoginRedirectUrl(request: NextRequest) {
  const loginUrl = request.nextUrl.clone();
  const { pathname } = request.nextUrl;
  loginUrl.pathname = ROUTES.login;
  loginUrl.search =
    pathname === ROUTES.home ? "" : `?next=${encodeURIComponent(pathname)}`;
  return loginUrl;
}

function buildDashboardRedirectUrl(request: NextRequest) {
  const dashboardUrl = request.nextUrl.clone();
  dashboardUrl.pathname = ROUTES.psychologist.home;
  dashboardUrl.search = "";
  return dashboardUrl;
}

function redirectKeepingCookies(url: URL, sourceResponse: NextResponse) {
  const redirectResponse = NextResponse.redirect(url);
  for (const cookie of sourceResponse.cookies.getAll()) {
    redirectResponse.cookies.set(cookie);
  }
  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  if (isMockAuth) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
          for (const [headerName, headerValue] of Object.entries(headers)) {
            response.headers.set(headerName, headerValue);
          }
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims);
  const { pathname } = request.nextUrl;
  const isPublicRoute = matchesAnyRoute(pathname, PUBLIC_ROUTES);

  if (
    !isAuthenticated &&
    !isPublicRoute &&
    pathname.startsWith(API_PATH_PREFIX)
  ) {
    return NextResponse.json(actionFailure(SESSION_EXPIRED_MESSAGE), {
      status: 401,
    });
  }

  if (!isAuthenticated && !isPublicRoute) {
    return redirectKeepingCookies(buildLoginRedirectUrl(request), response);
  }

  if (isAuthenticated && matchesAnyRoute(pathname, AUTH_ROUTES)) {
    return redirectKeepingCookies(buildDashboardRedirectUrl(request), response);
  }

  return response;
}
