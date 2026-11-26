import "server-only";

import type { QueryData } from "@supabase/supabase-js";
import { startOfMonth, subMonths } from "date-fns";
import type { AppointmentId } from "@/features/appointments/types";
import { getCurrentUser } from "@/features/auth/queries";
import type { PatientId } from "@/features/patients/types";
import {
  addDaysToDateKey,
  localDateToDateKey,
  zonedDateTime,
} from "@/lib/dates";
import { toAppTimeZone } from "@/lib/format";
import type { Cents } from "@/lib/money";
import type { MonthRange } from "@/lib/months";
import { assertNoDatabaseError } from "@/lib/supabase/errors";
import { createClient, type SupabaseServerClient } from "@/lib/supabase/server";
import { getTodayDateKey, isOverdue } from "./overdue";
import { buildMonthlyRevenue, REVENUE_MONTHS } from "./revenue";
import type { MonthlyRevenue, Payment, PaymentId } from "./types";

type MonthPaymentSummary = {
  receivedCents: Cents;
  receivedCount: number;
  overdueCents: Cents;
  overdueCount: number;
};

const PAYMENT_COLUMNS = `
  id,
  appointment_id,
  patient_id,
  amount_cents,
  status,
  method,
  due_date,
  paid_at,
  patient:patients!payments_patient_id_fkey (full_name, phone),
  appointments!payments_appointment_id_fkey!inner (starts_at)
`;

const DAY_START_TIME = "00:00";

function selectPayments(supabase: SupabaseServerClient) {
  return supabase.from("payments").select(PAYMENT_COLUMNS);
}

type PaymentRow = QueryData<ReturnType<typeof selectPayments>>[number];

function toPayment(row: PaymentRow): Payment {
  return {
    id: row.id as PaymentId,
    appointmentId: row.appointment_id as AppointmentId,
    patientId: row.patient_id as PatientId,
    patientName: row.patient?.full_name ?? "",
    patientPhone: row.patient?.phone ?? null,
    sessionStartsAt: row.appointments.starts_at,
    amountCents: row.amount_cents as Cents,
    status: row.status,
    method: row.method,
    dueDate: row.due_date,
    paidAt: row.paid_at,
  };
}

function sortBySessionDescending(payments: Payment[]): Payment[] {
  return payments.sort((first, second) =>
    second.sessionStartsAt.localeCompare(first.sessionStartsAt),
  );
}

function sumAmounts(payments: readonly Payment[]): Cents {
  return payments.reduce(
    (total, payment) => total + payment.amountCents,
    0,
  ) as Cents;
}

function getDayStart(dateKey: string): string {
  return zonedDateTime(dateKey, DAY_START_TIME).toISOString();
}

function selectChargeablePayments(supabase: SupabaseServerClient) {
  return selectPayments(supabase)
    .neq("status", "waived")
    .or(`status.neq.pending,due_date.lte.${getTodayDateKey()}`);
}

function toPayments(
  data: PaymentRow[] | null,
  error: { message: string } | null,
): Payment[] {
  assertNoDatabaseError(error);
  return sortBySessionDescending((data ?? []).map(toPayment));
}

function getRevenueWindowStartKey(now: Date): string {
  return localDateToDateKey(
    startOfMonth(subMonths(toAppTimeZone(now), REVENUE_MONTHS - 1)),
  );
}

export async function listPatientPayments(
  patientId: PatientId,
): Promise<Payment[]> {
  if (!(await getCurrentUser())) return [];
  const supabase = await createClient();
  const { data, error } = await selectChargeablePayments(supabase).eq(
    "patient_id",
    patientId,
  );
  return toPayments(data, error);
}

export async function getMonthPaymentSummary(
  range: MonthRange,
): Promise<MonthPaymentSummary> {
  const emptySummary = {
    receivedCents: 0 as Cents,
    receivedCount: 0,
    overdueCents: 0 as Cents,
    overdueCount: 0,
  };
  if (!(await getCurrentUser())) return emptySummary;

  const supabase = await createClient();
  const [receivedResult, pendingResult] = await Promise.all([
    selectPayments(supabase)
      .eq("status", "paid")
      .gte("paid_at", getDayStart(range.startKey))
      .lt("paid_at", getDayStart(addDaysToDateKey(range.endKey, 1))),
    selectPayments(supabase)
      .eq("status", "pending")
      .lte("due_date", getTodayDateKey()),
  ]);
  const receivedPayments = toPayments(
    receivedResult.data,
    receivedResult.error,
  );
  const overduePayments = toPayments(
    pendingResult.data,
    pendingResult.error,
  ).filter((payment) => isOverdue(payment));

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
  if (!(await getCurrentUser())) return [];
  const supabase = await createClient();
  const { data, error } = await selectChargeablePayments(supabase)
    .gte("appointments.starts_at", getDayStart(range.startKey))
    .lt(
      "appointments.starts_at",
      getDayStart(addDaysToDateKey(range.endKey, 1)),
    );
  return toPayments(data, error);
}

export async function listMonthlyRevenue(): Promise<MonthlyRevenue[]> {
  if (!(await getCurrentUser())) return [];
  const now = new Date();
  const windowStartKey = getRevenueWindowStartKey(now);
  const supabase = await createClient();
  const { data, error } = await selectChargeablePayments(supabase).or(
    `due_date.gte.${windowStartKey},paid_at.gte.${getDayStart(windowStartKey)}`,
  );
  return buildMonthlyRevenue(toPayments(data, error), now);
}
