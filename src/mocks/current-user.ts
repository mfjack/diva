import type { CurrentUser, UserId } from "@/features/auth/types";

export const mockCurrentUser: CurrentUser = {
  id: "00000000-0000-4000-8000-000000000001" as UserId,
  fullName: "Profissional de teste",
  email: "teste@diva.local",
  avatarUrl: null,
  role: "psychologist",
};
