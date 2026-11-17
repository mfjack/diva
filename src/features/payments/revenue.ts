import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toAppTimeZone } from "@/lib/format";
import type { Cents } from "@/lib/money";
import type { MonthlyRevenue, Payment } from "./types";

const REVENUE_MONTHS = 6;
const MONTH_KEY_FORMAT = "yyyy-MM";

function toMonthKey(date: Date | string): string {
  return format(toAppTimeZone(date), MONTH_KEY_FORMAT);
}

export function buildMonthlyRevenue(
  payments: readonly Payment[],
  now: Date,
): MonthlyRevenue[] {
  const months = Array.from({ length: REVENUE_MONTHS }, (_, index) =>
    subMonths(toAppTimeZone(now), REVENUE_MONTHS - 1 - index),
  );

  return months.map((month) => {
    const monthKey = toMonthKey(month);
    let receivedCents = 0;
    let pendingCents = 0;
    for (const payment of payments) {
      if (
        payment.status === "paid" &&
        payment.paidAt &&
        toMonthKey(payment.paidAt) === monthKey
      ) {
        receivedCents += payment.amountCents;
      }
      if (
        payment.status === "pending" &&
        toMonthKey(payment.sessionStartsAt) === monthKey
      ) {
        pendingCents += payment.amountCents;
      }
    }
    return {
      month: format(month, "MMM", { locale: ptBR }),
      receivedCents: receivedCents as Cents,
      pendingCents: pendingCents as Cents,
    };
  });
}
