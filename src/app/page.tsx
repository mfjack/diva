import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { getCurrentUser, getHomeRouteForRole } from "@/server/auth/session";

export default async function HomePage() {
  const currentUser = await getCurrentUser();
  redirect(currentUser ? getHomeRouteForRole(currentUser.role) : ROUTES.login);
}
