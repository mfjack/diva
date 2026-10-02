import type { Weekday } from "./types";

export const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0] as const satisfies Weekday[];

export const WEEKDAY_LABELS = {
  0: "Domingo",
  1: "Segunda-feira",
  2: "Terça-feira",
  3: "Quarta-feira",
  4: "Quinta-feira",
  5: "Sexta-feira",
  6: "Sábado",
} as const satisfies Record<Weekday, string>;
