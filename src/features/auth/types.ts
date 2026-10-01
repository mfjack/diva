import type { Brand } from "@/lib/brand";
import type { USER_ROLES } from "@/server/db/schema/enums";

export type UserId = Brand<string, "UserId">;

export type UserRole = (typeof USER_ROLES)[number];

export type CurrentUser = {
  id: UserId;
  name: string;
  email: string;
  role: UserRole;
};
