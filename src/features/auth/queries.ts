import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { LOGIN_ERROR_CODES, ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import type { CurrentUser, UserId } from "./types";

const AVATAR_METADATA_KEYS = ["avatar_url", "picture"] as const;

function getAvatarUrl(metadata: Record<string, unknown>): string | null {
  for (const key of AVATAR_METADATA_KEYS) {
    const value = metadata[key];
    if (typeof value === "string" && value.startsWith("https://")) {
      return value;
    }
  }
  return null;
}

const ACCESS_DENIED_SIGN_OUT_PATH = `${ROUTES.signOut}?error=${LOGIN_ERROR_CODES.accessDenied}`;

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, terms_version")
    .eq("id", authData.user.id)
    .single();
  if (!profile) return null;

  return {
    id: authData.user.id as UserId,
    fullName: profile.full_name,
    email: authData.user.email ?? "",
    avatarUrl: getAvatarUrl(authData.user.user_metadata),
    role: profile.role,
    acceptedTermsVersion: profile.terms_version,
  };
});

export async function getAuthorizedPsychologist(): Promise<CurrentUser | null> {
  const currentUser = await getCurrentUser();
  return currentUser?.role === "psychologist" ? currentUser : null;
}

export async function requirePsychologist(): Promise<CurrentUser> {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect(ROUTES.signOut);
  if (currentUser.role !== "psychologist")
    redirect(ACCESS_DENIED_SIGN_OUT_PATH);
  return currentUser;
}
