import { describe, expect, it } from "vitest";
import type { Cents } from "@/lib/money";
import { buildMonthlyRevenue } from "./revenue";
import type { Payment } from "./types";

function payment(changes: Partial<Payment>): Payment {
  return {
    status: "pending",
    paidAt: null,
    sessionStartsAt: "2026-11-10T13:00:00.000Z",
    amountCents: 20000 as Cents,
    ...changes,
  } as Payment;
}

describe("buildMonthlyRevenue", () => {
  const now = new Date("2026-11-16T15:00:00.000Z");

  it("returns the last six months ending in the current one", () => {
    const months = buildMonthlyRevenue([], now).map(({ month }) => month);
    expect(months).toEqual(["jun", "jul", "ago", "set", "out", "nov"]);
  });

  it("sums received by payment month and pending by session month", () => {
    const revenue = buildMonthlyRevenue(
      [
        payment({ status: "paid", paidAt: "2026-10-05T12:00:00.000Z" }),
        payment({ status: "pending" }),
        payment({ status: "waived" }),
      ],
      now,
    );
    expect(revenue.at(-2)).toMatchObject({ receivedCents: 20000 });
    expect(revenue.at(-1)).toMatchObject({
      receivedCents: 0,
      pendingCents: 20000,
    });
  });
});
