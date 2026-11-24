import { describe, expect, it } from "vitest";
import { patientSchema } from "./schemas";

const VALID_PATIENT = {
  fullName: "Ana Souza",
  email: "",
  phone: "",
  cpf: "",
  birthDate: "",
  preferredModality: "online",
  healthInsurance: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  paymentPlan: "per_session",
  notes: "",
} as const;

function getIssuePaths(input: Record<string, unknown>): string[] {
  const result = patientSchema.safeParse(input);
  return result.success
    ? []
    : result.error.issues.map((issue) => issue.path.join("."));
}

describe("patientSchema", () => {
  it("aceita pagamento por sessão sem dia do pagamento", () => {
    expect(getIssuePaths(VALID_PATIENT)).toEqual([]);
  });

  it("exige o dia do pagamento no plano mensal", () => {
    expect(
      getIssuePaths({ ...VALID_PATIENT, paymentPlan: "monthly_before" }),
    ).toEqual(["billingDay"]);
  });

  it("aponta o dia do pagamento junto com os outros erros", () => {
    expect(
      getIssuePaths({
        ...VALID_PATIENT,
        fullName: "",
        paymentPlan: "monthly_before",
      }),
    ).toEqual(["fullName", "billingDay"]);
  });

  it("recusa dias fora de 1 a 28", () => {
    expect(
      getIssuePaths({
        ...VALID_PATIENT,
        paymentPlan: "monthly_before",
        billingDay: 31,
      }),
    ).toEqual(["billingDay"]);
  });
});
