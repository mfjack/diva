export const ROUTES = {
  home: "/",
  login: "/login",
  authCallback: "/auth/callback",
  signOut: "/auth/sign-out",
  acceptTerms: "/accept-terms",
  terms: "/terms",
  privacy: "/privacy",
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

export const AUTH_ROUTES = [ROUTES.login] as const;

export const PUBLIC_ROUTES = [
  ...AUTH_ROUTES,
  "/auth",
  "/api/keep-alive",
  ROUTES.terms,
  ROUTES.privacy,
] as const;

export const LOGIN_ERROR_CODES = {
  invalidLink: "invalid-link",
  accessDenied: "access-denied",
} as const;

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
