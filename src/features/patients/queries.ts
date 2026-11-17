import "server-only";

import type { Appointment } from "@/features/appointments/types";
import type { Payment } from "@/features/payments/types";
import type { Cents } from "@/lib/money";
import { listMockAppointments } from "@/mocks/appointments";
import { findMockPatient, listMockPatients } from "@/mocks/patients";
import { listMockPayments } from "@/mocks/payments";
import type { StoredPatient } from "@/mocks/store";
import type { Patient } from "./types";

const UPCOMING_STATUSES = new Set<Appointment["status"]>([
  "scheduled",
  "confirmed",
]);

function toPatient(
  patient: StoredPatient,
  appointments: readonly Appointment[],
  payments: readonly Payment[],
  now: string,
): Patient {
  const patientAppointments = appointments.filter(
    ({ patientId }) => patientId === patient.id,
  );
  const nextAppointment = patientAppointments
    .filter(
      ({ status, startsAt }) => UPCOMING_STATUSES.has(status) && startsAt > now,
    )
    .sort((first, second) => first.startsAt.localeCompare(second.startsAt))[0];
  const pendingAmountCents = payments
    .filter(
      ({ patientId, status, sessionStartsAt }) =>
        patientId === patient.id &&
        status === "pending" &&
        sessionStartsAt <= now,
    )
    .reduce((total, { amountCents }) => total + amountCents, 0) as Cents;

  return {
    ...patient,
    nextAppointmentAt: nextAppointment?.startsAt ?? null,
    completedSessionCount: patientAppointments.filter(
      ({ status }) => status === "completed",
    ).length,
    pendingAmountCents,
  };
}

export async function listPatients(): Promise<Patient[]> {
  const now = new Date().toISOString();
  const appointments = listMockAppointments();
  const payments = listMockPayments();
  return listMockPatients()
    .map((patient) => toPatient(patient, appointments, payments, now))
    .sort((first, second) =>
      first.fullName.localeCompare(second.fullName, "pt-BR"),
    );
}

export async function getPatient(patientId: string): Promise<Patient | null> {
  const patient = findMockPatient(patientId);
  if (!patient) return null;
  return toPatient(
    patient,
    listMockAppointments(),
    listMockPayments(),
    new Date().toISOString(),
  );
}
