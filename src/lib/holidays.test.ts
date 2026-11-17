import { format } from "date-fns";
import { describe, expect, it } from "vitest";
import { getEasterSunday, getHoliday } from "./holidays";

describe("getEasterSunday", () => {
  it("computes Easter for known years", () => {
    expect(format(getEasterSunday(2026), "yyyy-MM-dd")).toBe("2026-04-05");
    expect(format(getEasterSunday(2027), "yyyy-MM-dd")).toBe("2027-03-28");
  });
});

describe("getHoliday", () => {
  it("finds fixed national holidays", () => {
    expect(getHoliday("2026-11-20")).toEqual({
      name: "Consciência Negra",
      isOptional: false,
    });
    expect(getHoliday("2026-12-25")?.name).toBe("Natal");
  });

  it("finds Easter-based holidays", () => {
    expect(getHoliday("2026-04-03")?.name).toBe("Sexta-feira Santa");
    expect(getHoliday("2026-02-16")).toEqual({
      name: "Carnaval",
      isOptional: true,
    });
    expect(getHoliday("2026-06-04")?.name).toBe("Corpus Christi");
  });

  it("returns null on regular days", () => {
    expect(getHoliday("2026-11-18")).toBeNull();
  });
});
