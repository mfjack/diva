import "server-only";

import type { PatientId } from "@/features/patients/types";
import { addDaysToDateKey, isSameDateKey, toDateKey } from "@/lib/dates";
import { mockAppointments } from "@/mocks/appointments";
import type { Appointment } from "./types";

const DAYS_IN_WEEK = 7;

export async function listAppointmentsBetween(
  startDateKey: string,
  endDateKey: string,
): Promise<Appointment[]> {
  return mockAppointments.filter((appointment) => {
    const dateKey = toDateKey(appointment.startsAt);
    return dateKey >= startDateKey && dateKey <= endDateKey;
  });
}

export async function listTodayAppointments(): Promise<Appointment[]> {
  const todayKey = toDateKey(new Date());
  return mockAppointments.filter((appointment) =>
    isSameDateKey(appointment.startsAt, todayKey),
  );
}

export async function listWeekAppointments(): Promise<Appointment[]> {
  const todayKey = toDateKey(new Date());
  return listAppointmentsBetween(
    todayKey,
    addDaysToDateKey(todayKey, DAYS_IN_WEEK - 1),
  );
}

export async function listRecentCancellations(
  limit: number,
): Promise<Appointment[]> {
  return mockAppointments
    .filter((appointment) => appointment.cancellation)
    .sort((first, second) =>
      (second.cancellation?.cancelledAt ?? "").localeCompare(
        first.cancellation?.cancelledAt ?? "",
      ),
    )
    .slice(0, limit);
}

export async function listPatientAppointments(
  patientId: PatientId,
): Promise<Appointment[]> {
  return mockAppointments
    .filter((appointment) => appointment.patientId === patientId)
    .sort((first, second) => second.startsAt.localeCompare(first.startsAt));
}

export async function listBusyPeriods(): Promise<
  Pick<Appointment, "startsAt" | "endsAt">[]
> {
  return mockAppointments
    .filter((appointment) => appointment.status !== "cancelled")
    .map(({ startsAt, endsAt }) => ({ startsAt, endsAt }));
}
