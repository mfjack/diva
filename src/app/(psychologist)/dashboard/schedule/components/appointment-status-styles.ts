import type { AppointmentStatus } from "@/features/appointments/types";

export const APPOINTMENT_STATUS_SURFACE_CLASS_NAMES = {
  scheduled: "border-warning/20 bg-warning/5 hover:border-warning",
  confirmed: "border-primary/15 bg-primary/4 hover:border-primary",
  completed: "border-success/20 bg-success/5 hover:border-success",
  no_show: "border-destructive/15 bg-destructive/4 hover:border-destructive",
  cancelled: "bg-muted/40 hover:border-muted-foreground",
} as const satisfies Record<AppointmentStatus, string>;
