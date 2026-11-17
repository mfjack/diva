import { describe, expect, it } from "vitest";
import { parseAuthMode } from "./auth-mode";

describe("parseAuthMode", () => {
  it("defaults to supabase", () => {
    expect(parseAuthMode(undefined, "development")).toBe("supabase");
  });

  it("accepts mock outside production", () => {
    expect(parseAuthMode("mock", "development")).toBe("mock");
  });

  it("refuses mock in production", () => {
    expect(() => parseAuthMode("mock", "production")).toThrow();
  });

  it("rejects unknown modes", () => {
    expect(() => parseAuthMode("none", "development")).toThrow();
  });
});
