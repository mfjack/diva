import { describe, expect, it } from "vitest";
import { getSingleSearchParam } from "./search-params";

describe("getSingleSearchParam", () => {
  it("returns a single string value", () => {
    expect(getSingleSearchParam("/dashboard")).toBe("/dashboard");
  });

  it("ignores repeated or missing params", () => {
    expect(getSingleSearchParam(["/a", "/b"])).toBeUndefined();
    expect(getSingleSearchParam(undefined)).toBeUndefined();
  });
});
