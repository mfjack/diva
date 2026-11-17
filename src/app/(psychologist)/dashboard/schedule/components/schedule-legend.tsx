import { APPOINTMENT_STATUS_LABELS } from "@/features/appointments/labels";
import type { AppointmentStatus } from "@/features/appointments/types";

const LEGEND_SWATCH_CLASS_NAMES = {
  confirmed: "border-l-[3px] border-l-primary bg-primary/15",
  scheduled: "border border-warning/70 border-dashed bg-warning/10",
  completed: "border-l-[3px] border-l-success bg-success/15",
  no_show: "border-l-[3px] border-l-destructive bg-destructive/10",
  cancelled: "border border-dashed bg-background",
} as const satisfies Record<AppointmentStatus, string>;

const LEGEND_STATUSES = Object.keys(
  LEGEND_SWATCH_CLASS_NAMES,
) as AppointmentStatus[];

export function ScheduleLegend() {
  return (
    <ul
      aria-label="Legenda"
      className="flex flex-wrap gap-x-5 gap-y-2 text-muted-foreground text-xs"
    >
      {LEGEND_STATUSES.map((status) => (
        <li key={status} className="flex items-center gap-2">
          <span
            aria-hidden
            className={`size-3 rounded-sm ${LEGEND_SWATCH_CLASS_NAMES[status]}`}
          />
          {APPOINTMENT_STATUS_LABELS[status]}
        </li>
      ))}
    </ul>
  );
}
