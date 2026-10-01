export const ROUTES = {
  home: "/",
  login: "/login",
  signUp: "/sign-up",
  psychologist: {
    dashboard: "/dashboard",
    schedule: "/dashboard/schedule",
    patients: "/dashboard/patients",
    finance: "/dashboard/finance",
    records: "/dashboard/records",
    settings: "/dashboard/settings",
  },
  patient: {
    home: "/portal",
    book: "/portal/book",
    appointments: "/portal/appointments",
    payments: "/portal/payments",
  },
} as const;

export const AUTH_ROUTES = [ROUTES.login, ROUTES.signUp] as const;

export const PSYCHOLOGIST_ROUTE_PREFIX = ROUTES.psychologist.dashboard;

export const PATIENT_ROUTE_PREFIX = ROUTES.patient.home;
