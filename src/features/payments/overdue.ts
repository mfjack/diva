import type { Payment } from "./types";

const OVERDUE_AFTER_DAYS = 7;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function getDaysSinceSession(
  payment: Pick<Payment, "sessionStartsAt">,
  now = Date.now(),
): number {
  return Math.floor(
    (now - new Date(payment.sessionStartsAt).getTime()) / DAY_IN_MS,
  );
}

export function isOverdue(
  payment: Pick<Payment, "status" | "sessionStartsAt">,
  now = Date.now(),
): boolean {
  return (
    payment.status === "pending" &&
    getDaysSinceSession(payment, now) > OVERDUE_AFTER_DAYS
  );
}
