import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { CurrentUser, UserId, UserRole } from "@/features/auth/types";
import { ROUTES } from "@/lib/routes";
import { USER_ROLES } from "@/server/db/schema/enums";
import { auth } from "./index";

const HOME_BY_ROLE = {
  psychologist: ROUTES.psychologist.dashboard,
  patient: ROUTES.patient.home,
} as const satisfies Record<UserRole, string>;

function isUserRole(value: unknown): value is UserRole {
  return USER_ROLES.some((role) => role === value);
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const { id, name, email, role } = session.user;

  return {
    id: id as UserId,
    name,
    email,
    role: isUserRole(role) ? role : "patient",
  };
});

export function getHomeRouteForRole(role: UserRole): string {
  return HOME_BY_ROLE[role];
}

export async function requireUser(): Promise<CurrentUser> {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect(ROUTES.login);
  return currentUser;
}

export async function requireRole(role: UserRole): Promise<CurrentUser> {
  const currentUser = await requireUser();
  if (currentUser.role !== role) {
    redirect(getHomeRouteForRole(currentUser.role));
  }
  return currentUser;
}
