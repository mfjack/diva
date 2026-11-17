import type { Brand } from "@/lib/brand";
import type { Enums } from "@/lib/supabase/database.types";

export type UserId = Brand<string, "UserId">;

export type UserRole = Enums<"user_role">;

export type CurrentUser = {
  id: UserId;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  acceptedTermsVersion: string | null;
};
