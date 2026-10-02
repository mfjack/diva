import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import type { CurrentUser, UserId, UserRole } from "./types";

const HOME_BY_ROLE = {
  psychologist: ROUTES.psychologist.dashboard,
  patient: ROUTES.patient.home,
} as const satisfies Record<UserRole, string>;

export function getHomeRouteForRole(role: UserRole): string {
  return HOME_BY_ROLE[role];
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", authData.user.id)
    .single();
  if (!profile) return null;

  return {
    id: authData.user.id as UserId,
    fullName: profile.full_name,
    email: authData.user.email ?? "",
    role: profile.role,
  };
});

export async function getUserWithRole(
  role: UserRole,
): Promise<CurrentUser | null> {
  const currentUser = await getCurrentUser();
  return currentUser?.role === role ? currentUser : null;
}

export async function requireRole(role: UserRole): Promise<CurrentUser> {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect(ROUTES.login);
  if (currentUser.role !== role) {
    redirect(getHomeRouteForRole(currentUser.role));
  }
  return currentUser;
}
