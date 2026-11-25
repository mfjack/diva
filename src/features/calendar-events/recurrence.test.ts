import { describe, expect, it } from "vitest";
import { planEventDateKeys } from "./recurrence";

describe("planEventDateKeys", () => {
  it("cria uma só data quando não repete", () => {
    expect(planEventDateKeys("2026-11-26", "none", "2026-12-31")).toEqual([
      "2026-11-26",
    ]);
  });

  it("repete toda semana até a data final", () => {
    expect(planEventDateKeys("2026-11-26", "weekly", "2026-12-10")).toEqual([
      "2026-11-26",
      "2026-12-03",
      "2026-12-10",
    ]);
  });

  it("repete a cada 15 dias", () => {
    expect(planEventDateKeys("2026-11-26", "biweekly", "2026-12-24")).toEqual([
      "2026-11-26",
      "2026-12-10",
      "2026-12-24",
    ]);
  });
});
