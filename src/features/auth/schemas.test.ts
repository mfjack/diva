import { describe, expect, it } from "vitest";
import { resetPasswordSchema, signInSchema, signUpSchema } from "./schemas";

describe("signInSchema", () => {
  it("normalizes the email", () => {
    const result = signInSchema.parse({
      email: "  Helena@Email.COM ",
      password: "x",
    });
    expect(result.email).toBe("helena@email.com");
  });
});

describe("signUpSchema", () => {
  const validInput = {
    fullName: "Helena Moraes",
    email: "helena@email.com",
    password: "senha1234",
  };

  it("accepts a valid account", () => {
    expect(signUpSchema.safeParse(validInput).success).toBe(true);
  });

  it("requires letters and numbers in the password", () => {
    expect(
      signUpSchema.safeParse({ ...validInput, password: "somenteletras" })
        .success,
    ).toBe(false);
    expect(
      signUpSchema.safeParse({ ...validInput, password: "12345678" }).success,
    ).toBe(false);
  });

  it("rejects short passwords", () => {
    expect(
      signUpSchema.safeParse({ ...validInput, password: "abc12" }).success,
    ).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("requires matching passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "senha1234",
      confirmPassword: "senha4321",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["confirmPassword"]);
  });
});
