import { describe, expect, it } from "vitest";
import { formatPhone, isValidCpf } from "./masks";

describe("formatPhone", () => {
  it("formats mobile numbers", () => {
    expect(formatPhone("11987654321")).toBe("(11) 98765-4321");
  });

  it("formats landline numbers", () => {
    expect(formatPhone("1133334444")).toBe("(11) 3333-4444");
  });
});

describe("isValidCpf", () => {
  it("accepts a valid CPF", () => {
    expect(isValidCpf("52998224725")).toBe(true);
  });

  it("rejects repeated digits", () => {
    expect(isValidCpf("11111111111")).toBe(false);
  });
});
