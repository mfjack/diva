import { describe, expect, it } from "vitest";
import type { Appointment } from "@/features/appointments/types";
import { zonedDateTime } from "@/lib/dates";
import {
  formatWeekRange,
  getVisibleDateKeys,
  getWeekLabel,
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
