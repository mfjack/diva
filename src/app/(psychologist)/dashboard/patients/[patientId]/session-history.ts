import type { Appointment, AppointmentId } from "@/features/appointments/types";
import type { ClinicalRecordSummary } from "@/features/clinical-records/types";
import { PAYMENT_STATUS_LABELS } from "@/features/payments/labels";
import {
  getTodayDateKey,
  isOverdue,
  isPaymentDue,
} from "@/features/payments/overdue";
import type { Payment } from "@/features/payments/types";

export type SessionHistoryEntry = {
  appointment: Appointment;
  payment: Payment | null;
  record: ClinicalRecordSummary | null;
};

export type SessionHistory = {
  entries: SessionHistoryEntry[];
  unlinkedRecords: ClinicalRecordSummary[];
};

type SessionHistoryInput = {
  appointments: readonly Appointment[];
  payments: readonly Payment[];
  records: readonly ClinicalRecordSummary[];
  now: string;
};

function indexByAppointment<
  TItem extends { appointmentId: AppointmentId | null },
>(items: readonly TItem[]): Map<AppointmentId, TItem> {
  const itemsByAppointment = new Map<AppointmentId, TItem>();
  for (const item of items) {
    if (item.appointmentId && !itemsByAppointment.has(item.appointmentId)) {
      itemsByAppointment.set(item.appointmentId, item);
    }
  }
  return itemsByAppointment;
}

function isRelevantEntry(
  { appointment, payment, record }: SessionHistoryEntry,
  now: string,
): boolean {
  if (appointment.startsAt <= now || record) return true;
  return (
    payment !== null &&
    (payment.status === "paid" ||
      isPaymentDue(payment, getTodayDateKey(new Date(now))))
  );
}

export function buildSessionHistory({
  appointments,
  payments,
  records,
  now,
}: SessionHistoryInput): SessionHistory {
  const paymentsByAppointment = indexByAppointment(payments);
  const recordsByAppointment = indexByAppointment(records);
  const entries = appointments
    .map((appointment) => ({
      appointment,
      payment: paymentsByAppointment.get(appointment.id) ?? null,
      record: recordsByAppointment.get(appointment.id) ?? null,
    }))
    .filter((entry) => isRelevantEntry(entry, now))
    .sort((first, second) =>
      second.appointment.startsAt.localeCompare(first.appointment.startsAt),
    );
  const linkedRecordIds = new Set(
    entries.flatMap(({ record }) => (record ? [record.id] : [])),
  );
  return {
    entries,
    unlinkedRecords: records.filter(({ id }) => !linkedRecordIds.has(id)),
  };
}

export const SESSION_PAYMENT_FILTERS = [
  "overdue",
  "pending",
  "paid",
  "waived",
  "refunded",
] as const;

export type SessionPaymentFilter = (typeof SESSION_PAYMENT_FILTERS)[number];

export const SESSION_PAYMENT_FILTER_LABELS = {
  overdue: "Em atraso",
  pending: "A receber",
  paid: "Pago",
  waived: "Sem cobrança",
  refunded: PAYMENT_STATUS_LABELS.refunded,
} as const satisfies Record<SessionPaymentFilter, string>;

export function getSessionPaymentFilter(
  payment: Payment | null,
  now: Date = new Date(),
): SessionPaymentFilter | null {
  if (!payment) return null;
  if (payment.status === "pending") {
    return isOverdue(payment, now) ? "overdue" : "pending";
  }
  return payment.status;
}
