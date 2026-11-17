import { describe, expect, it } from "vitest";
import type { Appointment } from "@/features/appointments/types";
import { zonedDateTime } from "@/lib/dates";
import {
  formatWeekRange,
  getBlockPosition,
  getHourRange,
  getHoursOfRange,
  getNowLineTopRem,
  getVisibleDateKeys,
  getWeekLabel,
  HOUR_HEIGHT_REM,
  listPendingRequests,
  mergeAppointments,
} from "./schedule-layout";

const MONDAY = "2026-11-23";
const SATURDAY = "2026-11-28";
const WEEK = [
  MONDAY,
  "2026-11-24",
  "2026-11-25",
  "2026-11-26",
  "2026-11-27",
  SATURDAY,
  "2026-11-29",
];

function at(dateKey: string, time: string): string {
  return zonedDateTime(dateKey, time).toISOString();
}

function appointment(
  startsAt: string,
  status: Appointment["status"],
): Appointment {
  return { startsAt, status } as Appointment;
}

describe("getVisibleDateKeys", () => {
  it("shows working days and days with sessions", () => {
    const visibleDateKeys = getVisibleDateKeys(
      WEEK,
      [{ weekday: 1 }],
      [{ startsAt: at(SATURDAY, "10:00") }],
    );
    expect(visibleDateKeys).toEqual([MONDAY, SATURDAY]);
  });

  it("falls back to Monday to Friday when no hours are configured", () => {
    expect(getVisibleDateKeys(WEEK, [], [])).toEqual(WEEK.slice(0, 5));
  });
});

describe("getHourRange", () => {
  it("covers availability and sessions", () => {
    const range = getHourRange(
      [{ startTime: "09:00", endTime: "12:30" }],
      [{ startsAt: at(MONDAY, "07:30"), endsAt: at(MONDAY, "08:20") }],
    );
    expect(range).toEqual({ firstHour: 7, lastHour: 13 });
    expect(getHoursOfRange(range)).toEqual([7, 8, 9, 10, 11, 12]);
  });

  it("falls back to business hours", () => {
    expect(getHourRange([], [])).toEqual({ firstHour: 8, lastHour: 18 });
  });
});

describe("getBlockPosition", () => {
  it("fills the hour slot of a 50 minute session with a small inset", () => {
    const position = getBlockPosition(
      at(MONDAY, "10:00"),
      at(MONDAY, "10:50"),
      8,
    );
    expect(position.topRem).toBeCloseTo(2 * HOUR_HEIGHT_REM + 0.25);
    expect(position.heightRem).toBeCloseTo(HOUR_HEIGHT_REM - 0.5);
  });

  it("snaps short sessions to half an hour", () => {
    const position = getBlockPosition(
      at(MONDAY, "10:00"),
      at(MONDAY, "10:20"),
      8,
    );
    expect(position.heightRem).toBeCloseTo(HOUR_HEIGHT_REM / 2 - 0.5);
  });
});

describe("getNowLineTopRem", () => {
  const range = { firstHour: 8, lastHour: 18 };

  it("returns the offset only for today within the range", () => {
    expect(getNowLineTopRem(at(MONDAY, "09:30"), MONDAY, range)).toBe(
      1.5 * HOUR_HEIGHT_REM,
    );
    expect(getNowLineTopRem(at(MONDAY, "09:30"), SATURDAY, range)).toBeNull();
    expect(getNowLineTopRem(at(MONDAY, "21:00"), MONDAY, range)).toBeNull();
  });
});

describe("getWeekLabel", () => {
  it("describes the week relative to today", () => {
    expect(getWeekLabel(0)).toBe("Esta semana");
    expect(getWeekLabel(1)).toBe("Próxima semana");
    expect(getWeekLabel(-1)).toBe("Semana passada");
    expect(getWeekLabel(3)).toBe("Daqui a 3 semanas");
    expect(getWeekLabel(-2)).toBe("Há 2 semanas");
  });
});

describe("listPendingRequests", () => {
  it("keeps only future sessions awaiting confirmation, soonest first", () => {
    const now = at(MONDAY, "12:00");
    const later = appointment(at(SATURDAY, "10:00"), "scheduled");
    const sooner = appointment(at("2026-11-24", "10:00"), "scheduled");
    const past = appointment(at(MONDAY, "08:00"), "scheduled");
    const confirmed = appointment(at(SATURDAY, "11:00"), "confirmed");

    expect(listPendingRequests([later, past, confirmed, sooner], now)).toEqual([
      sooner,
      later,
    ]);
  });
});

describe("formatWeekRange", () => {
  it("omits the month of the first day inside the same month", () => {
    expect(formatWeekRange(MONDAY, "2026-11-29")).toBe("23 a 29 de nov");
  });

  it("shows both months across a month change", () => {
    expect(formatWeekRange("2026-11-30", "2026-12-06")).toBe(
      "30 de nov a 6 de dez",
    );
  });
});

describe("mergeAppointments", () => {
  it("keeps one copy of each appointment", () => {
    const first = { id: "a" } as Appointment;
    const second = { id: "b" } as Appointment;
    expect(mergeAppointments([first, second], [first])).toEqual([
      first,
      second,
    ]);
  });
});
