import { describe, expect, it } from "vitest";
import { getPaymentDueDate } from "./due-date";

describe("getPaymentDueDate", () => {
  it("vence no dia da sessão quando paga por sessão", () => {
    expect(
      getPaymentDueDate(
        { paymentPlan: "per_session", billingDay: null },
        "2026-11-18",
      ),
    ).toBe("2026-11-18");
  });

  it("vence no dia escolhido do mês da sessão quando paga antes", () => {
    expect(
      getPaymentDueDate(
        { paymentPlan: "monthly_before", billingDay: 5 },
        "2026-11-25",
      ),
    ).toBe("2026-11-05");
  });

  it("vence no dia escolhido do mês seguinte quando paga após as sessões", () => {
    expect(
      getPaymentDueDate(
        { paymentPlan: "monthly_after", billingDay: 5 },
        "2026-12-16",
      ),
    ).toBe("2027-01-05");
  });
});
