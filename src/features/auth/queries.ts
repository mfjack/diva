import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { isMockAuth } from "@/lib/auth-mode";
import { LOGIN_ERROR_CODES, ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import { mockCurrentUser } from "@/mocks/current-user";
import type { CurrentUser, UserId } from "./types";

const ACCESS_DENIED_PATH = `${ROUTES.login}?error=${LOGIN_ERROR_CODES.accessDenied}`;

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (isMockAuth) return mockCurrentUser;

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

export async function getAuthorizedPsychologist(): Promise<CurrentUser | null> {
  const currentUser = await getCurrentUser();
  return currentUser?.role === "psychologist" ? currentUser : null;
}

export async function requirePsychologist(): Promise<CurrentUser> {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect(ROUTES.login);
  if (currentUser.role !== "psychologist") redirect(ACCESS_DENIED_PATH);
  return currentUser;
}
