import "server-only";

import type { PatientId } from "@/features/patients/types";
import type { Cents } from "@/lib/money";
import { mockMonthlyRevenue, mockPayments } from "@/mocks/payments";
import { isOverdue } from "./overdue";
import type { MonthlyRevenue, Payment } from "./types";

export type FinanceSummary = {
  receivedCents: Cents;
  pendingCents: Cents;
  pendingCount: number;
  overdueCents: Cents;
  averageTicketCents: Cents;
};

const RECEIVED_PERIOD_DAYS = 30;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function sumAmounts(payments: readonly Payment[]): Cents {
  return payments.reduce(
    (total, payment) => total + payment.amountCents,
    0,
  ) as Cents;
}

export async function listPayments(): Promise<Payment[]> {
  return mockPayments;
}

export async function listPendingPayments(): Promise<Payment[]> {
  return mockPayments.filter((payment) => payment.status === "pending");
}

export async function listPatientPayments(
  patientId: PatientId,
): Promise<Payment[]> {
  return mockPayments.filter((payment) => payment.patientId === patientId);
}

export async function getFinanceSummary(): Promise<FinanceSummary> {
  const periodStart = Date.now() - RECEIVED_PERIOD_DAYS * DAY_IN_MS;
  const paidPayments = mockPayments.filter(
    ({ status, paidAt }) =>
      status === "paid" &&
      paidAt !== null &&
      new Date(paidAt).getTime() >= periodStart,
  );
  const pendingPayments = mockPayments.filter(
    ({ status }) => status === "pending",
  );
  const receivedCents = sumAmounts(paidPayments);

  return {
    receivedCents,
    pendingCents: sumAmounts(pendingPayments),
    pendingCount: pendingPayments.length,
    overdueCents: sumAmounts(
      pendingPayments.filter((payment) => isOverdue(payment)),
    ),
    averageTicketCents: Math.round(
      paidPayments.length > 0 ? receivedCents / paidPayments.length : 0,
    ) as Cents,
  };
}

export async function listMonthlyRevenue(): Promise<MonthlyRevenue[]> {
  return mockMonthlyRevenue;
}
