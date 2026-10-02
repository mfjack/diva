import { redirect } from "next/navigation";
import { getCurrentUser, getHomeRouteForRole } from "@/features/auth/queries";
import { ROUTES } from "@/lib/routes";

export default async function HomePage() {
  const currentUser = await getCurrentUser();
  redirect(currentUser ? getHomeRouteForRole(currentUser.role) : ROUTES.login);
}
