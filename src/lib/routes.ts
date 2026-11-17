export const ROUTES = {
  home: "/",
  login: "/login",
  signUp: "/sign-up",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  authCallback: "/auth/callback",
  psychologist: {
    dashboard: "/dashboard",
    home: "/dashboard/schedule",
    schedule: "/dashboard/schedule",
    patients: "/dashboard/patients",
    finance: "/dashboard/finance",
    studies: "/dashboard/studies",
    records: "/dashboard/records",
    settings: "/dashboard/settings",
  },
} as const;

export const AUTH_ROUTES = [
  ROUTES.login,
  ROUTES.signUp,
  ROUTES.forgotPassword,
] as const;

export const PUBLIC_ROUTES = [...AUTH_ROUTES, "/auth"] as const;

export const LOGIN_ERROR_CODES = {
  invalidLink: "invalid-link",
  accessDenied: "access-denied",
} as const;

export function buildAuthRoute(route: string, nextPath?: string): string {
  return nextPath ? `${route}?next=${encodeURIComponent(nextPath)}` : route;
}

export function buildNewSessionNoteRoute(patientId: string): string {
  const searchParams = new URLSearchParams({ patientId, kind: "session_note" });
  return `${ROUTES.psychologist.records}/new?${searchParams.toString()}`;
}

export function buildExpenseAttachmentRoute(attachmentId: string): string {
  return `${ROUTES.psychologist.finance}/attachments/${encodeURIComponent(attachmentId)}`;
}

export function buildStudyNotePdfRoute(noteId: string): string {
  return `${ROUTES.psychologist.studies}/${encodeURIComponent(noteId)}/pdf`;
}
