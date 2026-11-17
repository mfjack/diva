import { describe, expect, it } from "vitest";
import type { Cents } from "@/lib/money";
import { buildChargeMessage } from "./charge-message";

const FIRST_SESSION = {
  sessionStartsAt: "2026-11-03T13:00:00.000Z",
  amountCents: 18000 as Cents,
};

const SECOND_SESSION = {
  sessionStartsAt: "2026-11-10T13:00:00.000Z",
  amountCents: 18000 as Cents,
};

describe("buildChargeMessage", () => {
  it("cobra uma sessão com a chave Pix", () => {
    const message = buildChargeMessage({
      patientName: "Ana Souza",
      items: [FIRST_SESSION],
      pixKey: "consultorio@email.com",
    });

    expect(message).toContain("Olá, Ana!");
    expect(message).toContain("sessão de 03/11/2026");
    expect(message).toContain("consultorio@email.com");
  });

  it("lista as sessões em ordem e soma o total", () => {
    const message = buildChargeMessage({
      patientName: "Ana Souza",
      items: [SECOND_SESSION, FIRST_SESSION],
      pixKey: null,
    });

    expect(message.indexOf("03/11/2026")).toBeLessThan(
      message.indexOf("10/11/2026"),
    );
    expect(message).toMatch(/Total: \$\s360,00/);
    expect(message).not.toContain("Pix");
  });
});
