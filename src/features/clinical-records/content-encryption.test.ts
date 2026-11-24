import { describe, expect, it } from "vitest";
import {
  decryptClinicalContent,
  decryptClinicalFile,
  encryptClinicalContent,
  encryptClinicalFile,
} from "./content-encryption";

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

describe("clinical file encryption", () => {
  const fileContent = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 1, 2, 3]);

  it("round-trips the original bytes", () => {
    expect(
      Array.from(decryptClinicalFile(encryptClinicalFile(fileContent))),
    ).toEqual(Array.from(fileContent));
  });

  it("does not keep the original bytes in the payload", () => {
    const payload = Buffer.from(encryptClinicalFile(fileContent));
    expect(payload.includes(Buffer.from(fileContent))).toBe(false);
  });

  it("rejects a tampered file", () => {
    const payload = encryptClinicalFile(fileContent);
    payload[payload.length - 1] = (payload.at(-1) ?? 0) ^ 0xff;
    expect(() => decryptClinicalFile(payload)).toThrow();
  });
});
