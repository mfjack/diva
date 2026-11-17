import "server-only";

import { shouldAutoComplete } from "@/features/appointments/status-transitions";
import type { Appointment } from "@/features/appointments/types";
import { getMockDatabase, saveMockDatabase } from "./store";

function completeFinishedAppointments(appointments: Appointment[]): void {
  const now = Date.now();
  const finishedAppointments = appointments.filter((appointment) =>
    shouldAutoComplete(appointment, now),
  );
  if (finishedAppointments.length === 0) return;
  for (const appointment of finishedAppointments) {
    appointment.status = "completed";
  }
  saveMockDatabase();
}

function withSeriesId(appointments: Appointment[]): Appointment[] {
  for (const appointment of appointments) {
    appointment.seriesId ??= null;
  }
  return appointments;
}

export function listMockAppointments(): Appointment[] {
  const { appointments } = getMockDatabase();
  completeFinishedAppointments(appointments);
  return withSeriesId(appointments);
}

export function findMockAppointment(
  appointmentId: string,
): Appointment | undefined {
  return listMockAppointments().find(({ id }) => id === appointmentId);
}

export function insertMockAppointment(appointment: Appointment): void {
  const { appointments } = getMockDatabase();
  appointments.push(appointment);
  appointments.sort((first, second) =>
    first.startsAt.localeCompare(second.startsAt),
  );
  saveMockDatabase();
}

export function updateMockAppointment(
  appointmentId: string,
  changes: Partial<Omit<Appointment, "id">>,
): void {
  const appointment = findMockAppointment(appointmentId);
  if (!appointment) return;
  Object.assign(appointment, changes);
  saveMockDatabase();
}
