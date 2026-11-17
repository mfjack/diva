"use client";

import {
  CalendarClock,
  CalendarX2,
  Check,
  CircleCheck,
  type LucideIcon,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SheetFooter } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateAppointmentStatusMutation } from "@/features/appointments/hooks/use-update-appointment-status-mutation";
import type { AppointmentStatusUpdate } from "@/features/appointments/schemas";
import {
  canChangeSchedule,
  getAllowedStatusUpdates,
} from "@/features/appointments/status-transitions";
import type { Appointment } from "@/features/appointments/types";

const STATUS_UPDATE_ACTIONS = {
  confirmed: {
    label: "Confirmar",
    successMessage: "Sessão confirmada.",
    icon: Check,
    variant: "default",
  },
  completed: {
    label: "Realizada",
    successMessage: "Sessão marcada como realizada.",
    icon: CircleCheck,
    variant: "default",
  },
  no_show: {
    label: "Falta",
    successMessage: "Falta registrada.",
    icon: UserX,
    variant: "outline",
  },
} as const satisfies Record<
  AppointmentStatusUpdate,
  {
    label: string;
    successMessage: string;
    icon: LucideIcon;
    variant: "default" | "outline";
  }
>;

type StatusUpdateButtonProps = {
  status: AppointmentStatusUpdate;
  isUpdating: boolean;
  isDisabled: boolean;
  onUpdate: (status: AppointmentStatusUpdate) => void;
};

function StatusUpdateButton({
  status,
  isUpdating,
  isDisabled,
  onUpdate,
}: StatusUpdateButtonProps) {
  const action = STATUS_UPDATE_ACTIONS[status];
  const Icon = action.icon;

  function handleClick() {
    onUpdate(status);
  }

  return (
    <Button
      size="lg"
      variant={action.variant}
      disabled={isDisabled}
      aria-busy={isUpdating}
      onClick={handleClick}
      className="flex-1"
    >
      {isUpdating ? <Spinner aria-hidden /> : <Icon aria-hidden />}
      {action.label}
    </Button>
  );
}

type AppointmentActionsProps = {
  appointment: Appointment;
  now: number;
  onCancelRequest: (appointment: Appointment) => void;
  onRescheduleRequest: (appointment: Appointment) => void;
};

export function AppointmentActions({
  appointment,
  now,
  onCancelRequest,
  onRescheduleRequest,
}: AppointmentActionsProps) {
  const updateStatusMutation = useUpdateAppointmentStatusMutation();
  const statusUpdates = getAllowedStatusUpdates(appointment, now);
  const isScheduleChangeable = canChangeSchedule(appointment, now);

  if (statusUpdates.length === 0 && !isScheduleChangeable) return null;

  function handleStatusUpdated(status: AppointmentStatusUpdate) {
    toast.success(STATUS_UPDATE_ACTIONS[status].successMessage);
  }

  function handleStatusUpdate(status: AppointmentStatusUpdate) {
    updateStatusMutation.mutate(
      { appointmentId: appointment.id, status },
      {
        onSuccess: () => handleStatusUpdated(status),
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function handleReschedule() {
    onRescheduleRequest(appointment);
  }

  function handleCancel() {
    onCancelRequest(appointment);
  }

  return (
    <SheetFooter className="flex flex-col gap-3 border-t p-6">
      {statusUpdates.length > 0 && (
        <div className="flex gap-3">
          {statusUpdates.map((status) => (
            <StatusUpdateButton
              key={status}
              status={status}
              isUpdating={
                updateStatusMutation.isPending &&
                updateStatusMutation.variables?.status === status
              }
              isDisabled={updateStatusMutation.isPending}
              onUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
      {isScheduleChangeable && (
        <div className="flex gap-3">
          <Button
            size="lg"
            variant="outline"
            disabled={updateStatusMutation.isPending}
            onClick={handleReschedule}
            className="flex-1"
          >
            <CalendarClock aria-hidden />
            Reagendar
          </Button>
          <Button
            size="lg"
            variant="ghost"
            disabled={updateStatusMutation.isPending}
            onClick={handleCancel}
            className="flex-1 text-destructive hover:text-destructive"
          >
            <CalendarX2 aria-hidden />
            Cancelar
          </Button>
        </div>
      )}
    </SheetFooter>
  );
}
