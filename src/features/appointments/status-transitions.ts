import type { AppointmentStatusUpdate } from "./schemas";
import type { Appointment, AppointmentStatus } from "./types";

type AppointmentTiming = Pick<Appointment, "status" | "startsAt">;
type AppointmentEnding = Pick<Appointment, "status" | "endsAt">;

type StatusUpdatesByMoment = {
  beforeStart: readonly AppointmentStatusUpdate[];
  afterStart: readonly AppointmentStatusUpdate[];
};

const ALLOWED_STATUS_UPDATES = {
  scheduled: { beforeStart: ["confirmed"], afterStart: [] },
  confirmed: { beforeStart: [], afterStart: ["completed", "no_show"] },
  completed: { beforeStart: [], afterStart: ["no_show"] },
  cancelled: { beforeStart: [], afterStart: [] },
  no_show: { beforeStart: [], afterStart: ["completed"] },
} as const satisfies Record<AppointmentStatus, StatusUpdatesByMoment>;

const OPEN_STATUSES: ReadonlySet<AppointmentStatus> = new Set([
  "scheduled",
  "confirmed",
]);

export function isOpenAppointment(status: AppointmentStatus): boolean {
  return OPEN_STATUSES.has(status);
}

export function hasStarted(startsAt: string, now = Date.now()): boolean {
  return new Date(startsAt).getTime() <= now;
}

export function shouldAutoComplete(
  { status, endsAt }: AppointmentEnding,
  now = Date.now(),
): boolean {
  return OPEN_STATUSES.has(status) && new Date(endsAt).getTime() <= now;
}

export function getAllowedStatusUpdates(
  { status, startsAt }: AppointmentTiming,
  now = Date.now(),
): readonly AppointmentStatusUpdate[] {
  const updates = ALLOWED_STATUS_UPDATES[status];
  return hasStarted(startsAt, now) ? updates.afterStart : updates.beforeStart;
}

export function canUpdateStatus(
  appointment: AppointmentTiming,
  nextStatus: AppointmentStatusUpdate,
  now = Date.now(),
): boolean {
  return getAllowedStatusUpdates(appointment, now).includes(nextStatus);
}

export function canChangeSchedule(
  { status, startsAt }: AppointmentTiming,
  now = Date.now(),
): boolean {
  return OPEN_STATUSES.has(status) && !hasStarted(startsAt, now);
}
