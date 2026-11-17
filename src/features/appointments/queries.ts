import "server-only";

import type { PatientId } from "@/features/patients/types";
import {
  getPracticeSettings,
  listAvailabilityBlocks,
  listAvailabilityRules,
} from "@/features/practice-settings/queries";
import { addDaysToDateKey, toDateKey } from "@/lib/dates";
import {
  findMockAppointment,
  listMockAppointments,
} from "@/mocks/appointments";
import {
  type PlannedSession,
  planSessionDateKeys,
  planSessions,
  type SessionPlanInput,
} from "./recurring-sessions";
import type { Appointment, AppointmentSeriesId } from "./types";

export async function listAppointmentsBetween(
  startDateKey: string,
  endDateKey: string,
): Promise<Appointment[]> {
  return listMockAppointments().filter((appointment) => {
    const dateKey = toDateKey(appointment.startsAt);
    return dateKey >= startDateKey && dateKey <= endDateKey;
  });
}

export async function listPatientAppointments(
  patientId: PatientId,
): Promise<Appointment[]> {
  return listMockAppointments()
    .filter((appointment) => appointment.patientId === patientId)
    .sort((first, second) => second.startsAt.localeCompare(first.startsAt));
}

export async function listAwaitingConfirmation(): Promise<Appointment[]> {
  const now = new Date().toISOString();
  return listMockAppointments()
    .filter(
      (appointment) =>
        appointment.status === "scheduled" && appointment.startsAt > now,
    )
    .sort((first, second) => first.startsAt.localeCompare(second.startsAt));
}

export async function getAppointment(
  appointmentId: string,
): Promise<Appointment | null> {
  return findMockAppointment(appointmentId) ?? null;
}

export async function hasConflictingAppointment(
  startsAt: string,
  endsAt: string,
  ignoredAppointmentId?: string,
): Promise<boolean> {
  return listMockAppointments().some(
    (appointment) =>
      appointment.id !== ignoredAppointmentId &&
      appointment.status !== "cancelled" &&
      appointment.startsAt < endsAt &&
      appointment.endsAt > startsAt,
  );
}

export async function getSessionPlan(
  input: SessionPlanInput,
): Promise<PlannedSession[]> {
  const dateKeys = planSessionDateKeys(input);
  const firstDateKey = dateKeys[0] ?? input.date;
  const lastDateKey = dateKeys.at(-1) ?? input.date;
  const [settings, rules, appointments, blocks] = await Promise.all([
    getPracticeSettings(),
    listAvailabilityRules(),
    listAppointmentsBetween(
      addDaysToDateKey(firstDateKey, -1),
      addDaysToDateKey(lastDateKey, 1),
    ),
    listAvailabilityBlocks(),
  ]);

  return planSessions(input, {
    availability: {
      rules,
      sessionDurationMinutes: settings.sessionDurationMinutes,
    },
    appointments: appointments.filter(({ status }) => status !== "cancelled"),
    blocks,
    now: Date.now(),
  });
}

export async function listFollowingSeriesAppointments(
  seriesId: AppointmentSeriesId,
  fromStartsAt: string,
): Promise<Appointment[]> {
  return listMockAppointments().filter(
    (appointment) =>
      appointment.seriesId === seriesId && appointment.startsAt >= fromStartsAt,
  );
}
