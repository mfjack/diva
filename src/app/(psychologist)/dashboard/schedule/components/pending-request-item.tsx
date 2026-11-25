import { Check } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AppointmentModalityLabel } from "@/features/appointments/components/appointment-modality-label";
import type { Appointment } from "@/features/appointments/types";
import { formatShortDate, formatTime } from "@/lib/format";
import { getInitials } from "@/lib/get-initials";

type PendingRequestItemProps = {
  appointment: Appointment;
  isConfirming: boolean;
  onConfirm: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
};

export function PendingRequestItem({
  appointment,
  isConfirming,
  onConfirm,
  onCancel,
}: PendingRequestItemProps) {
  function handleConfirm() {
    onConfirm(appointment);
  }

  function handleCancel() {
    onCancel(appointment);
  }

  return (
    <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <Avatar className="size-9">
          <AvatarFallback className="bg-accent font-medium text-accent-foreground text-sm">
            {getInitials(appointment.patientName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate font-medium text-sm">
            {appointment.patientName}
          </span>
          <span className="text-muted-foreground text-sm tabular-nums">
            {formatShortDate(appointment.startsAt)} ·{" "}
            {formatTime(appointment.startsAt)}
          </span>
          <AppointmentModalityLabel modality={appointment.modality} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          size="lg"
          disabled={isConfirming}
          aria-busy={isConfirming}
          onClick={handleConfirm}
        >
          {isConfirming ? <Spinner aria-hidden /> : <Check aria-hidden />}
          Confirmar
        </Button>
        <Button
          size="lg"
          variant="ghost"
          disabled={isConfirming}
          onClick={handleCancel}
          className="text-destructive hover:text-destructive"
        >
          Cancelar
        </Button>
      </div>
    </li>
  );
}
