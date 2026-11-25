import { describe, expect, it } from "vitest";
import type { Appointment } from "@/features/appointments/types";
import type { CalendarEventId } from "@/features/calendar-events/types";
import { zonedDateTime } from "@/lib/dates";
import {
  buildScheduleHref,
  formatWeekRange,
  getPeriodLabel,
  getVisibleDateKeys,
  getVisibleMonthWeeks,
  listDayItems,
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
    expect(getPeriodLabel("week", 0)).toBe("Esta semana");
    expect(getPeriodLabel("week", 1)).toBe("Próxima semana");
    expect(getPeriodLabel("week", -1)).toBe("Semana passada");
    expect(getPeriodLabel("week", 3)).toBe("Daqui a 3 semanas");
    expect(getPeriodLabel("week", -2)).toBe("Há 2 semanas");
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

describe("getPeriodLabel for months", () => {
  it("describes the month relative to today", () => {
    expect(getPeriodLabel("month", 0)).toBe("Este mês");
    expect(getPeriodLabel("month", -1)).toBe("Mês passado");
    expect(getPeriodLabel("month", 3)).toBe("Daqui a 3 meses");
  });
});

describe("getVisibleMonthWeeks", () => {
  it("keeps only the weekdays with working hours or sessions", () => {
    const weeks = [WEEK];
    const visibleWeeks = getVisibleMonthWeeks(
      weeks,
      [{ weekday: 1 }, { weekday: 3 }],
      [{ startsAt: at(SATURDAY, "10:00") }],
    );
    expect(visibleWeeks).toEqual([[MONDAY, "2026-11-25", SATURDAY]]);
  });
});

describe("buildScheduleHref", () => {
  it("keeps the default week view clean and names the month view", () => {
    expect(buildScheduleHref("week", 0)).toBe("/dashboard/schedule");
    expect(buildScheduleHref("week", -2)).toBe("/dashboard/schedule?week=-2");
    expect(buildScheduleHref("month", 0)).toBe(
      "/dashboard/schedule?view=month",
    );
    expect(buildScheduleHref("month", 1)).toBe(
      "/dashboard/schedule?view=month&month=1",
    );
  });
});

describe("listDayItems", () => {
  it("mixes sessions and events of the day in time order", () => {
    const items = listDayItems(
      MONDAY,
      [
        appointment(at(MONDAY, "14:00"), "confirmed"),
        appointment(at(MONDAY, "09:00"), "cancelled"),
        appointment(at(SATURDAY, "09:00"), "confirmed"),
      ],
      [
        {
          id: "event-1" as CalendarEventId,
          seriesId: null,
          title: "Supervisão",
          notes: null,
          startsAt: at(MONDAY, "10:00"),
          endsAt: at(MONDAY, "11:00"),
        },
      ],
    );
    expect(items.map(({ kind }) => kind)).toEqual([
      "session",
      "event",
      "session",
    ]);
  });

  it("puts a cancelled session after the active one at the same time", () => {
    const items = listDayItems(
      MONDAY,
      [
        appointment(at(MONDAY, "09:00"), "cancelled"),
        appointment(at(MONDAY, "09:00"), "confirmed"),
      ],
      [],
    );
    expect(
      items.map((item) =>
        item.kind === "session" ? item.appointment.status : item.kind,
      ),
    ).toEqual(["confirmed", "cancelled"]);
  });
});
