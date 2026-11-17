import { MapPin, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { APPOINTMENT_MODALITY_LABELS } from "../labels";
import type { Appointment } from "../types";

type AppointmentModalityLabelProps = Pick<Appointment, "modality"> & {
  isTextHidden?: boolean;
  className?: string;
};

export function AppointmentModalityLabel({
  modality,
  isTextHidden = false,
  className,
}: AppointmentModalityLabelProps) {
  const Icon = modality === "online" ? Video : MapPin;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-muted-foreground text-sm",
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5 shrink-0" />
      <span className={cn(isTextHidden && "sr-only")}>
        {APPOINTMENT_MODALITY_LABELS[modality]}
      </span>
    </span>
  );
}
