import { describe, expect, it } from "vitest";
import { calendarEventSchema } from "./schemas";

const VALID_EVENT = {
  title: "Supervisão",
  date: "2026-11-26",
  startTime: "14:00",
  endTime: "15:30",
  notes: "",
  repeat: "none",
  repeatUntil: "",
} as const;

function getIssuePaths(input: Record<string, unknown>): string[] {
  const result = calendarEventSchema.safeParse(input);
  return result.success
    ? []
    : result.error.issues.map((issue) => issue.path.join("."));
}

describe("calendarEventSchema", () => {
  it("aceita um evento que não se repete", () => {
    expect(getIssuePaths(VALID_EVENT)).toEqual([]);
  });

  it("exige o fim depois do início", () => {
    expect(getIssuePaths({ ...VALID_EVENT, endTime: "13:00" })).toEqual([
      "endTime",
    ]);
  });

  it("exige a data final quando o evento se repete", () => {
    expect(getIssuePaths({ ...VALID_EVENT, repeat: "weekly" })).toEqual([
      "repeatUntil",
    ]);
  });

  it("limita a repetição a 6 meses", () => {
    expect(
      getIssuePaths({
        ...VALID_EVENT,
        repeat: "weekly",
        repeatUntil: "2027-12-31",
      }),
    ).toEqual(["repeatUntil"]);
  });
});
