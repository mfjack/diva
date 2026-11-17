import { toMonthKey } from "@/lib/months";
import type { PaymentTerms } from "./types";

export const MIN_BILLING_DAY = 1;
export const MAX_BILLING_DAY = 28;

function toBillingDateKey(sessionDateKey: string, billingDay: number): string {
  return `${toMonthKey(sessionDateKey)}-${String(billingDay).padStart(2, "0")}`;
}

export function getPaymentDueDate(
  { paymentPlan, billingDay }: PaymentTerms,
  sessionDateKey: string,
): string {
  switch (paymentPlan) {
    case "monthly":
      return toBillingDateKey(sessionDateKey, billingDay ?? MIN_BILLING_DAY);
    case "per_session":
      return sessionDateKey;
  }
}
