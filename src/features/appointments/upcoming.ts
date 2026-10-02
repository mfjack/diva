import type { Appointment } from "./types";

const ACTIVE_STATUSES = new Set<Appointment["status"]>([
  "scheduled",
  "confirmed",
]);

export function isUpcoming(appointment: Appointment, now = Date.now()) {
  return (
    ACTIVE_STATUSES.has(appointment.status) &&
    new Date(appointment.endsAt).getTime() > now
  );
}

export function splitAppointmentsByTime(
  appointments: readonly Appointment[],
  now = Date.now(),
): { upcoming: Appointment[]; past: Appointment[] } {
  const upcoming = appointments
    .filter((appointment) => isUpcoming(appointment, now))
    .sort((first, second) => first.startsAt.localeCompare(second.startsAt));
  const past = appointments
    .filter((appointment) => !isUpcoming(appointment, now))
    .sort((first, second) => second.startsAt.localeCompare(first.startsAt));

  return { upcoming, past };
}
