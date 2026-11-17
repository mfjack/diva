import "server-only";

import type { PatientId } from "@/features/patients/types";
import { toDateKey } from "@/lib/dates";
import type { Cents } from "@/lib/money";
import { isDateKeyInRange, type MonthRange } from "@/lib/months";
import { listMockPayments } from "@/mocks/payments";
import { isOverdue } from "./overdue";
import { buildMonthlyRevenue } from "./revenue";
import type { MonthlyRevenue, Payment } from "./types";

export type MonthPaymentSummary = {
  receivedCents: Cents;
  receivedCount: number;
  overdueCents: Cents;
  overdueCount: number;
};

function sumAmounts(payments: readonly Payment[]): Cents {
  return payments.reduce(
    (total, payment) => total + payment.amountCents,
    0,
  ) as Cents;
}

function isChargeable(payment: Payment, now: string): boolean {
  return payment.status !== "pending" || payment.sessionStartsAt <= now;
}

function listChargeablePayments(): Payment[] {
  const now = new Date().toISOString();
  return listMockPayments()
    .filter((payment) => isChargeable(payment, now))
    .sort((first, second) =>
      second.sessionStartsAt.localeCompare(first.sessionStartsAt),
    );
}

export async function listPatientPayments(
  patientId: PatientId,
): Promise<Payment[]> {
  return listChargeablePayments().filter(
    (payment) => payment.patientId === patientId,
  );
}

export async function getMonthPaymentSummary(
  range: MonthRange,
): Promise<MonthPaymentSummary> {
  const payments = listChargeablePayments();
  const receivedPayments = payments.filter(
    ({ status, paidAt }) =>
      status === "paid" &&
      paidAt !== null &&
      isDateKeyInRange(toDateKey(paidAt), range),
  );
  const overduePayments = payments.filter((payment) => isOverdue(payment));

  return {
    receivedCents: sumAmounts(receivedPayments),
    receivedCount: receivedPayments.length,
    overdueCents: sumAmounts(overduePayments),
    overdueCount: overduePayments.length,
  };
}

export async function listPaymentsBetween(
  range: MonthRange,
): Promise<Payment[]> {
  return listChargeablePayments().filter(({ sessionStartsAt }) =>
    isDateKeyInRange(toDateKey(sessionStartsAt), range),
  );
}

export async function listMonthlyRevenue(): Promise<MonthlyRevenue[]> {
  return buildMonthlyRevenue(listChargeablePayments(), new Date());
}
