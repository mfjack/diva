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

  it("vence no dia escolhido do mês da sessão quando paga por mês", () => {
    expect(
      getPaymentDueDate(
        { paymentPlan: "monthly", billingDay: 5 },
        "2026-11-25",
      ),
    ).toBe("2026-11-05");
  });
});
