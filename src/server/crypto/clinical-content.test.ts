import { describe, expect, it } from "vitest";
import {
  decryptClinicalContent,
  encryptClinicalContent,
} from "./clinical-content";

describe("clinical content encryption", () => {
  it("round-trips the original text", () => {
    const plainText = "Paciente relata melhora significativa do sono.";
    expect(decryptClinicalContent(encryptClinicalContent(plainText))).toBe(
      plainText,
    );
  });

  it("produces a different payload on each encryption", () => {
    const plainText = "Sessão de acolhimento.";
    expect(encryptClinicalContent(plainText)).not.toBe(
      encryptClinicalContent(plainText),
    );
  });

  it("rejects a tampered payload", () => {
    const payload = encryptClinicalContent("Conteúdo sigiloso.");
    const tamperedPayload = `${payload.slice(0, -4)}AAAA`;
    expect(() => decryptClinicalContent(tamperedPayload)).toThrow();
  });
});
