import { describe, expect, it } from "vitest";
import { acceptTermsSchema } from "./schemas";

describe("acceptTermsSchema", () => {
  it("exige que os termos sejam aceitos", () => {
    expect(acceptTermsSchema.safeParse({ hasAccepted: true }).success).toBe(
      true,
    );
    expect(acceptTermsSchema.safeParse({ hasAccepted: false }).success).toBe(
      false,
    );
  });
});
