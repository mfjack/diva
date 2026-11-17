import { describe, expect, it } from "vitest";
import {
  formatOverdueLabel,
  getDaysOverdue,
  isOverdue,
  isPaymentDue,
} from "./overdue";

const TODAY = "2026-11-17";
const NOW = new Date("2026-11-17T18:00:00.000Z");

describe("isPaymentDue", () => {
  it("considera devido o pagamento pendente que vence hoje", () => {
    expect(isPaymentDue({ status: "pending", dueDate: TODAY }, TODAY)).toBe(
      true,
    );
  });

  it("ignora pagamentos que ainda não venceram ou já foram pagos", () => {
    expect(
      isPaymentDue({ status: "pending", dueDate: "2026-11-18" }, TODAY),
    ).toBe(false);
    expect(isPaymentDue({ status: "paid", dueDate: "2026-11-01" }, TODAY)).toBe(
      false,
    );
  });
});

describe("isOverdue", () => {
  it("atrasa o pagamento por sessão logo depois do horário da sessão", () => {
    const payment = { status: "pending", dueDate: TODAY } as const;
    expect(
      isOverdue(
        { ...payment, sessionStartsAt: "2026-11-17T13:00:00.000Z" },
        NOW,
      ),
    ).toBe(true);
    expect(
      isOverdue(
        { ...payment, sessionStartsAt: "2026-11-17T22:00:00.000Z" },
        NOW,
      ),
    ).toBe(false);
  });

  it("atrasa o pagamento mensal só depois do dia do vencimento", () => {
    const sessionStartsAt = "2026-11-04T13:00:00.000Z";
    expect(
      isOverdue({ status: "pending", dueDate: TODAY, sessionStartsAt }, NOW),
    ).toBe(false);
    expect(
      isOverdue(
        { status: "pending", dueDate: "2026-11-16", sessionStartsAt },
        NOW,
      ),
    ).toBe(true);
  });

  it("não atrasa pagamentos pagos ou sem cobrança", () => {
    const sessionStartsAt = "2026-11-01T13:00:00.000Z";
    expect(
      isOverdue(
        { status: "paid", dueDate: "2026-11-01", sessionStartsAt },
        NOW,
      ),
    ).toBe(false);
    expect(
      isOverdue(
        { status: "waived", dueDate: "2026-11-01", sessionStartsAt },
        NOW,
      ),
    ).toBe(false);
  });
});

describe("getDaysOverdue", () => {
  it("conta os dias desde o vencimento", () => {
    expect(getDaysOverdue({ dueDate: "2026-11-10" }, TODAY)).toBe(7);
  });
});

describe("formatOverdueLabel", () => {
  it("descreve o atraso em dias", () => {
    expect(formatOverdueLabel(0)).toBe("Venceu hoje");
    expect(formatOverdueLabel(1)).toBe("1 dia de atraso");
    expect(formatOverdueLabel(7)).toBe("7 dias de atraso");
  });
});
