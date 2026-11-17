import { differenceInCalendarDays } from "date-fns";
import { dateKeyToLocalDate, toDateKey } from "@/lib/dates";
import type { Payment } from "./types";

type DuePayment = Pick<Payment, "status" | "dueDate">;

type OverduePayment = DuePayment & Pick<Payment, "sessionStartsAt">;

export function getTodayDateKey(now: Date = new Date()): string {
  return toDateKey(now);
}

export function isPaymentDue(
  payment: DuePayment,
  today: string = getTodayDateKey(),
): boolean {
  return payment.status === "pending" && payment.dueDate <= today;
}

function isDueOnSessionDay(payment: OverduePayment): boolean {
  return toDateKey(payment.sessionStartsAt) === payment.dueDate;
}

export function isOverdue(
  payment: OverduePayment,
  now: Date = new Date(),
): boolean {
  if (payment.status !== "pending") return false;
  const today = getTodayDateKey(now);
  if (payment.dueDate < today) return true;
  return (
    payment.dueDate === today &&
    isDueOnSessionDay(payment) &&
    new Date(payment.sessionStartsAt).getTime() <= now.getTime()
  );
}

export function getDaysOverdue(
  payment: Pick<Payment, "dueDate">,
  today: string = getTodayDateKey(),
): number {
  return differenceInCalendarDays(
    dateKeyToLocalDate(today),
    dateKeyToLocalDate(payment.dueDate),
  );
}

export function formatOverdueLabel(daysOverdue: number): string {
  if (daysOverdue <= 0) return "Venceu hoje";
  return daysOverdue === 1
    ? "1 dia de atraso"
    : `${daysOverdue} dias de atraso`;
}
