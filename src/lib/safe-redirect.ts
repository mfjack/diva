import { ROUTES } from "./routes";

export function getSafeRedirectPath(
  path: unknown,
  fallbackPath: string = ROUTES.psychologist.home,
): string {
  if (typeof path !== "string") return fallbackPath;

  const isInternalPath =
    path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\");

  return isInternalPath ? path : fallbackPath;
}
