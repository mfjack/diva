import "server-only";

import type { Appointment } from "@/features/appointments/types";
import { getPaymentDueDate } from "@/features/payments/due-date";
import type {
  Payment,
  PaymentId,
  PaymentMethod,
  PaymentStatus,
  PaymentTerms,
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

const DEFAULT_PAYMENT_TERMS: PaymentTerms = {
  paymentPlan: "per_session",
  billingDay: null,
};

function getDueDate(patientId: string, sessionStartsAt: string): string {
  return getPaymentDueDate(
    findMockPatient(patientId) ?? DEFAULT_PAYMENT_TERMS,
    toDateKey(sessionStartsAt),
  );
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
    dueDate: getDueDate(appointment.patientId, appointment.startsAt),
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
  const lastReceiptNumber = Math.max(
    0,
    ...listMockPayments().map(({ receiptNumber }) => receiptNumber ?? 0),
  );
  Object.assign(payment, {
    status: "paid",
    method,
    paidAt,
    receiptNumber: lastReceiptNumber + 1,
  } satisfies Partial<Payment>);
  setAppointmentPaymentStatus(appointmentId, "paid");
  saveMockDatabase();
}

export function undoMockPayment(appointmentId: string): void {
  const payment = findPaymentOfAppointment(appointmentId);
  if (payment?.status !== "paid") return;
  Object.assign(payment, {
    status: "pending",
    method: null,
    paidAt: null,
    receiptNumber: null,
    dueDate: getDueDate(payment.patientId, payment.sessionStartsAt),
  } satisfies Partial<Payment>);
  setAppointmentPaymentStatus(appointmentId, "pending");
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
  payment.dueDate = getDueDate(payment.patientId, sessionStartsAt);
  saveMockDatabase();
}

export function updateMockPendingPaymentDueDates(
  patientId: string,
  terms: PaymentTerms,
): void {
  for (const payment of listMockPayments()) {
    if (payment.patientId !== patientId || payment.status !== "pending") {
      continue;
    }
    payment.dueDate = getPaymentDueDate(
      terms,
      toDateKey(payment.sessionStartsAt),
    );
  }
  saveMockDatabase();
}
