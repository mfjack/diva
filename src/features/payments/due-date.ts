import { addMonthsToMonthKey, toMonthKey } from "@/lib/months";
import type { PaymentPlan, PaymentTerms } from "./types";

export const MIN_BILLING_DAY = 1;
export const MAX_BILLING_DAY = 28;

const MONTHLY_PAYMENT_PLANS: ReadonlySet<PaymentPlan> = new Set([
  "monthly_before",
  "monthly_after",
]);

export function isMonthlyPaymentPlan(paymentPlan: PaymentPlan): boolean {
  return MONTHLY_PAYMENT_PLANS.has(paymentPlan);
}

function toBillingDateKey(monthKey: string, billingDay: number): string {
  return `${monthKey}-${String(billingDay).padStart(2, "0")}`;
}

export function getPaymentDueDate(
  { paymentPlan, billingDay }: PaymentTerms,
  sessionDateKey: string,
): string {
  const sessionMonthKey = toMonthKey(sessionDateKey);
  const dueDay = billingDay ?? MIN_BILLING_DAY;
  switch (paymentPlan) {
    case "monthly_before":
      return toBillingDateKey(sessionMonthKey, dueDay);
    case "monthly_after":
      return toBillingDateKey(addMonthsToMonthKey(sessionMonthKey, 1), dueDay);
    case "per_session":
      return sessionDateKey;
  }
}
