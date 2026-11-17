import { describe, expect, it } from "vitest";
import { ROUTES } from "./routes";
import { getSafeRedirectPath } from "./safe-redirect";

describe("getSafeRedirectPath", () => {
  it("keeps internal paths", () => {
    expect(getSafeRedirectPath("/dashboard/patients")).toBe(
      "/dashboard/patients",
    );
  });

  it("falls back to the home route for missing values", () => {
    expect(getSafeRedirectPath(undefined)).toBe(ROUTES.psychologist.home);
    expect(getSafeRedirectPath(["/dashboard"])).toBe(ROUTES.psychologist.home);
  });

  it("rejects external and protocol-relative urls", () => {
    expect(getSafeRedirectPath("https://evil.com")).toBe(
      ROUTES.psychologist.home,
    );
    expect(getSafeRedirectPath("//evil.com")).toBe(ROUTES.psychologist.home);
    expect(getSafeRedirectPath("/\\evil.com")).toBe(ROUTES.psychologist.home);
  });
});
