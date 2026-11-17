import "server-only";

import type { Appointment } from "@/features/appointments/types";
import type {
  Payment,
  PaymentId,
  PaymentMethod,
  PaymentStatus,
} from "@/features/payments/types";
import { toDateKey } from "@/lib/dates";
import { findMockAppointment } from "./appointments";
import { findMockPatient } from "./patients";
import { getMockDatabase, saveMockDatabase } from "./store";

type RegisteredPayment = {
  method: PaymentMethod;
  paidAt: string;
};

export function listMockPayments(): Payment[] {
  return getMockDatabase().payments;
}

function findPaymentOfAppointment(appointmentId: string): Payment | undefined {
  return listMockPayments().find(
    (payment) => payment.appointmentId === appointmentId,
  );
}

function setAppointmentPaymentStatus(
  appointmentId: string,
  status: PaymentStatus,
): void {
  const appointment = findMockAppointment(appointmentId);
  if (appointment) appointment.paymentStatus = status;
}

export function insertMockPayment(appointment: Appointment): void {
  getMockDatabase().payments.push({
    id: crypto.randomUUID() as PaymentId,
    appointmentId: appointment.id,
    patientId: appointment.patientId,
    patientName: appointment.patientName,
    patientPhone: findMockPatient(appointment.patientId)?.phone ?? null,
    sessionStartsAt: appointment.startsAt,
    amountCents: appointment.priceCents,
    status: "pending",
    method: null,
    dueDate: toDateKey(appointment.startsAt),
    paidAt: null,
    receiptNumber: null,
  });
  saveMockDatabase();
}

export function registerMockPayment(
  appointmentId: string,
  { method, paidAt }: RegisteredPayment,
): void {
  const payment = findPaymentOfAppointment(appointmentId);
  if (!payment) return;
  const paidCount = listMockPayments().filter(
    ({ status }) => status === "paid",
  ).length;
  Object.assign(payment, {
    status: "paid",
    method,
    paidAt,
    receiptNumber: paidCount + 1,
  } satisfies Partial<Payment>);
  setAppointmentPaymentStatus(appointmentId, "paid");
  saveMockDatabase();
}

export function waiveMockPayment(appointmentId: string): void {
  const payment = findPaymentOfAppointment(appointmentId);
  if (payment?.status === "pending") payment.status = "waived";
  setAppointmentPaymentStatus(appointmentId, "waived");
  saveMockDatabase();
}

export function updateMockPaymentSession(
  appointmentId: string,
  sessionStartsAt: string,
): void {
  const payment = findPaymentOfAppointment(appointmentId);
  if (!payment) return;
  payment.sessionStartsAt = sessionStartsAt;
  payment.dueDate = toDateKey(sessionStartsAt);
  saveMockDatabase();
}
