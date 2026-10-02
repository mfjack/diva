import { MapPin, Video } from "lucide-react";
import type { ReactNode } from "react";
import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge";
import { formatTime } from "@/lib/format";
import { APPOINTMENT_MODALITY_LABELS } from "../labels";
import type { Appointment } from "../types";
import { AppointmentStatusBadge } from "./appointment-status-badge";

type AppointmentRowProps = {
  appointment: Appointment;
  leading?: ReactNode;
  isPaymentVisible?: boolean;
  isPatientNameVisible?: boolean;
  action?: ReactNode;
};

function hasPaymentDue(appointment: Appointment): boolean {
  const hasStarted = new Date(appointment.startsAt).getTime() <= Date.now();
  return hasStarted && appointment.paymentStatus !== "waived";
}

export function AppointmentModalityLabel({
  modality,
}: Pick<Appointment, "modality">) {
  const Icon = modality === "online" ? Video : MapPin;
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
      <Icon aria-hidden className="size-3.5" />
      {APPOINTMENT_MODALITY_LABELS[modality]}
    </span>
  );
}

export function AppointmentRow({
  appointment,
  leading,
  isPaymentVisible = false,
  isPatientNameVisible = true,
  action,
}: AppointmentRowProps) {
  return (
    <div className="flex items-center gap-4 py-3.5">
      <div className="flex w-14 shrink-0 flex-col">
        {leading ?? (
          <span className="font-semibold tabular-nums">
            {formatTime(appointment.startsAt)}
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
        {isPatientNameVisible && (
          <span className="min-w-0 flex-1 truncate font-medium">
            {appointment.patientName}
          </span>
        )}
        <AppointmentModalityLabel modality={appointment.modality} />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-2">
        <AppointmentStatusBadge status={appointment.status} />
        {isPaymentVisible && hasPaymentDue(appointment) && (
          <PaymentStatusBadge status={appointment.paymentStatus} />
        )}
      </div>
      {action}
    </div>
  );
}
