import { describe, expect, it } from "vitest";
import type {
  AvailabilityRule,
  AvailabilityRuleId,
} from "@/features/practice-settings/types";
import { zonedDateTime } from "@/lib/dates";
import {
  listBookableSessions,
  planSessionDateKeys,
  planSessions,
  type SessionPlanContext,
} from "./recurring-sessions";

const NOW = new Date("2026-11-17T12:00:00.000Z").getTime();

const ALL_WEEK_RULES: AvailabilityRule[] = ([0, 1, 2, 3, 4, 5, 6] as const).map(
  (weekday) => ({
    id: `rule-${weekday}` as AvailabilityRuleId,
    weekday,
    startTime: "06:00",
    endTime: "22:00",
    modality: null,
  }),
);

const EMPTY_CONTEXT: SessionPlanContext = {
  availability: { rules: ALL_WEEK_RULES, sessionDurationMinutes: 50 },
  appointments: [],
  blocks: [],
  now: NOW,
};

function busyAt(dateKey: string, time: string) {
  const start = zonedDateTime(dateKey, time);
  return {
    startsAt: start.toISOString(),
    endsAt: new Date(start.getTime() + 50 * 60_000).toISOString(),
  };
}

describe("planSessionDateKeys", () => {
  it("returns a single date when not repeating", () => {
    expect(planSessionDateKeys({ date: "2026-11-18", repeat: "none" })).toEqual(
      ["2026-11-18"],
    );
  });

  it("repeats every week until the end of the month", () => {
    expect(
      planSessionDateKeys({ date: "2026-11-04", repeat: "weekly" }),
    ).toEqual(["2026-11-04", "2026-11-11", "2026-11-18", "2026-11-25"]);
  });

  it("repeats every two weeks within the month", () => {
    expect(
      planSessionDateKeys({ date: "2026-12-02", repeat: "biweekly" }),
    ).toEqual(["2026-12-02", "2026-12-16", "2026-12-30"]);
  });

  it("keeps a single session when it is the last weekday of the month", () => {
    expect(
      planSessionDateKeys({ date: "2026-11-25", repeat: "weekly" }),
    ).toEqual(["2026-11-25"]);
  });
});

describe("planSessions", () => {
  it("skips holidays, conflicts and blocks only in a series", () => {
    const sessions = planSessions(
      { date: "2026-12-04", time: "10:00", repeat: "weekly" },
      {
        ...EMPTY_CONTEXT,
        appointments: [busyAt("2026-12-11", "10:30")],
        blocks: [
          {
            startsAt: zonedDateTime("2026-12-18", "00:00").toISOString(),
            endsAt: zonedDateTime("2026-12-19", "00:00").toISOString(),
          },
        ],
      },
    );
    expect(
      sessions.map(({ dateKey, skipReason }) => [dateKey, skipReason]),
    ).toEqual([
      ["2026-12-04", null],
      ["2026-12-11", "conflict"],
      ["2026-12-18", "blocked"],
      ["2026-12-25", "holiday"],
    ]);
    expect(sessions[3]?.holidayName).toBe("Natal");
    expect(listBookableSessions(sessions)).toHaveLength(1);
    expect(listBookableSessions(sessions, ["2026-12-04"])).toEqual([]);
  });

  it("keeps a single session on a holiday the professional chose", () => {
    const [session] = planSessions(
      {
        date: "2026-11-20",
        time: "10:00",
        repeat: "none",
      },
      EMPTY_CONTEXT,
    );
    expect(session?.skipReason).toBeNull();
  });

  it("refuses sessions that already started", () => {
    const [session] = planSessions(
      {
        date: "2026-11-17",
        time: "08:00",
        repeat: "none",
      },
      EMPTY_CONTEXT,
    );
    expect(session?.skipReason).toBe("past");
  });

  it("refuses sessions outside the working hours", () => {
    const [session] = planSessions(
      { date: "2026-11-18", time: "21:30", repeat: "none" },
      EMPTY_CONTEXT,
    );
    expect(session?.skipReason).toBe("unavailable");
  });

  it("uses the session duration to detect conflicts", () => {
    const [session] = planSessions(
      {
        date: "2026-11-18",
        time: "10:00",
        repeat: "none",
      },
      { ...EMPTY_CONTEXT, appointments: [busyAt("2026-11-18", "10:50")] },
    );
    expect(session?.skipReason).toBeNull();
  });
});
