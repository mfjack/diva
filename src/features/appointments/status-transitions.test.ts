import { describe, expect, it } from "vitest";
import {
  canChangeSchedule,
  canUpdateStatus,
  getAllowedStatusUpdates,
  hasStarted,
  shouldAutoComplete,
} from "./status-transitions";

const NOW = new Date("2026-11-16T15:00:00.000Z").getTime();
const PAST = "2026-11-16T13:00:00.000Z";
const FUTURE = "2026-11-20T12:00:00.000Z";

describe("hasStarted", () => {
  it("compares the start with now", () => {
    expect(hasStarted(PAST, NOW)).toBe(true);
    expect(hasStarted(FUTURE, NOW)).toBe(false);
  });
});

describe("getAllowedStatusUpdates", () => {
  it("lets pending sessions be confirmed only before they start", () => {
    expect(
      getAllowedStatusUpdates({ status: "scheduled", startsAt: FUTURE }, NOW),
    ).toEqual(["confirmed"]);
    expect(
      getAllowedStatusUpdates({ status: "scheduled", startsAt: PAST }, NOW),
    ).toEqual([]);
  });

  it("lets confirmed sessions be completed or missed only after they start", () => {
    expect(
      getAllowedStatusUpdates({ status: "confirmed", startsAt: FUTURE }, NOW),
    ).toEqual([]);
    expect(
      getAllowedStatusUpdates({ status: "confirmed", startsAt: PAST }, NOW),
    ).toEqual(["completed", "no_show"]);
  });

  it("lets finished sessions be corrected between completed and missed", () => {
    expect(
      getAllowedStatusUpdates({ status: "completed", startsAt: PAST }, NOW),
    ).toEqual(["no_show"]);
    expect(
      getAllowedStatusUpdates({ status: "no_show", startsAt: PAST }, NOW),
    ).toEqual(["completed"]);
  });

  it("locks cancelled sessions", () => {
    expect(
      getAllowedStatusUpdates({ status: "cancelled", startsAt: PAST }, NOW),
    ).toEqual([]);
  });
});

describe("shouldAutoComplete", () => {
  it("completes open sessions once they end", () => {
    expect(shouldAutoComplete({ status: "scheduled", endsAt: PAST }, NOW)).toBe(
      true,
    );
    expect(shouldAutoComplete({ status: "confirmed", endsAt: PAST }, NOW)).toBe(
      true,
    );
  });

  it("keeps future, cancelled and missed sessions untouched", () => {
    expect(
      shouldAutoComplete({ status: "confirmed", endsAt: FUTURE }, NOW),
    ).toBe(false);
    expect(shouldAutoComplete({ status: "cancelled", endsAt: PAST }, NOW)).toBe(
      false,
    );
    expect(shouldAutoComplete({ status: "no_show", endsAt: PAST }, NOW)).toBe(
      false,
    );
  });
});

describe("canUpdateStatus", () => {
  it("rejects completing a future session", () => {
    expect(
      canUpdateStatus(
        { status: "confirmed", startsAt: FUTURE },
        "completed",
        NOW,
      ),
    ).toBe(false);
  });
});

describe("canChangeSchedule", () => {
  it("allows cancelling or rescheduling open sessions before they start", () => {
    expect(
      canChangeSchedule({ status: "confirmed", startsAt: FUTURE }, NOW),
    ).toBe(true);
    expect(
      canChangeSchedule({ status: "scheduled", startsAt: FUTURE }, NOW),
    ).toBe(true);
  });

  it("blocks sessions that started or are closed", () => {
    expect(
      canChangeSchedule({ status: "confirmed", startsAt: PAST }, NOW),
    ).toBe(false);
    expect(
      canChangeSchedule({ status: "cancelled", startsAt: FUTURE }, NOW),
    ).toBe(false);
  });
});
