"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FormDialog } from "@/components/dialog/form-dialog";
import { DateField } from "@/components/form/date-field";
import type { SessionAvailability } from "@/features/practice-settings/availability";
import { formatDateTime } from "@/lib/format";
import { useRescheduleAppointmentMutation } from "../hooks/use-reschedule-appointment-mutation";
import {
  type RescheduleAppointmentInput,
  rescheduleAppointmentSchema,
} from "../schemas";
import type { Appointment } from "../types";
import { AvailableTimeField } from "./available-time-field";

type RescheduleAppointmentDialogProps = {
  appointment: Pick<Appointment, "id" | "startsAt" | "patientName"> | null;
  availability: SessionAvailability;
  onOpenChange: (isOpen: boolean) => void;
};

export function RescheduleAppointmentDialog({
  appointment,
  availability,
  onOpenChange,
}: RescheduleAppointmentDialogProps) {
  const rescheduleMutation = useRescheduleAppointmentMutation();
  const form = useForm<RescheduleAppointmentInput>({
    resolver: zodResolver(rescheduleAppointmentSchema),
    defaultValues: { date: "", time: "" },
  });
  const date = useWatch({ control: form.control, name: "date" });

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) form.reset();
    onOpenChange(isOpen);
  }

  function handleRescheduled() {
    toast.success("Sessão reagendada.");
    handleOpenChange(false);
  }

  function handleError(error: Error) {
    toast.error(error.message);
  }

  const handleSubmit = form.handleSubmit((input) => {
    if (!appointment) return;
    rescheduleMutation.mutate(
      { appointmentId: appointment.id, input },
      { onSuccess: handleRescheduled, onError: handleError },
    );
  });

  return (
    <FormDialog
      isOpen={appointment !== null}
      onOpenChange={handleOpenChange}
      title="Reagendar sessão"
      description={
        appointment
          ? `${appointment.patientName} · marcada para ${formatDateTime(appointment.startsAt)}.`
          : undefined
      }
      submitLabel="Reagendar"
      isSubmitting={rescheduleMutation.isPending}
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-2 gap-4">
        <DateField
          control={form.control}
          name="date"
          label="Nova data"
          allowedDates="today-onwards"
        />
        <AvailableTimeField
          control={form.control}
          name="time"
          label="Novo horário"
          dateKey={date}
          availability={availability}
        />
      </div>
    </FormDialog>
  );
}
