import type { EventRepeat } from "./recurrence";

const EVENT_REPEAT_LABELS = {
  none: "Não repete",
  weekly: "Toda semana",
  biweekly: "A cada 15 dias",
} as const satisfies Record<EventRepeat, string>;

export const EVENT_REPEAT_OPTIONS = Object.entries(EVENT_REPEAT_LABELS).map(
  ([value, label]) => ({ value, label }),
);
