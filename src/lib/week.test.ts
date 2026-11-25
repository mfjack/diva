import { describe, expect, it } from "vitest";
import {
  getMonthWeeks,
  getWeekDateKeys,
  getWeekOffsetOfDateKey,
  parseCalendarOffset,
} from "./week";

const NOW = new Date("2026-11-25T15:00:00.000Z");

describe("parseCalendarOffset", () => {
  it("aceita inteiros dentro do limite e ignora o resto", () => {
    expect(parseCalendarOffset("3")).toBe(3);
    expect(parseCalendarOffset("abc")).toBe(0);
    expect(parseCalendarOffset("999")).toBe(52);
  });
});

describe("getWeekDateKeys", () => {
  it("começa na segunda-feira da semana", () => {
    expect(getWeekDateKeys(0, NOW)[0]).toBe("2026-11-23");
    expect(getWeekDateKeys(1, NOW)[0]).toBe("2026-11-30");
  });
});

describe("getWeekOffsetOfDateKey", () => {
  it("conta quantas semanas separam o dia de hoje", () => {
    expect(getWeekOffsetOfDateKey("2026-11-27", NOW)).toBe(0);
    expect(getWeekOffsetOfDateKey("2026-12-02", NOW)).toBe(1);
    expect(getWeekOffsetOfDateKey("2026-11-02", NOW)).toBe(-3);
  });
});

describe("getMonthWeeks", () => {
  it("cobre o mês inteiro em semanas de segunda a domingo", () => {
    const { monthKey, weeks } = getMonthWeeks(0, NOW);
    expect(monthKey).toBe("2026-11");
    expect(weeks[0]?.[0]).toBe("2026-10-26");
    expect(weeks.at(-1)?.at(-1)).toBe("2026-12-06");
    expect(weeks).toHaveLength(6);
  });

  it("avança e volta meses", () => {
    expect(getMonthWeeks(1, NOW).monthKey).toBe("2026-12");
    expect(getMonthWeeks(-1, NOW).monthKey).toBe("2026-10");
  });
});
