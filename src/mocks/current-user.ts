import type { CurrentUser, UserId } from "@/features/auth/types";
import { DEFAULT_PRACTICE_SETTINGS } from "./practice-defaults";

export const mockCurrentUser: CurrentUser = {
  id: "user-psychologist" as UserId,
  fullName: DEFAULT_PRACTICE_SETTINGS.psychologistName,
  email: "helena.duarte@psicologia.com.br",
  role: "psychologist",
};
