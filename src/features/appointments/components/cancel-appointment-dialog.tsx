"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TriangleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormDialog } from "@/components/dialog/form-dialog";
import { SelectField } from "@/components/form/select-field";
import { TextareaField } from "@/components/form/textarea-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { isLateCancellation } from "../cancellation-policy";
import { useCancelAppointmentMutation } from "../hooks/use-cancel-appointment-mutation";
import { CANCELLATION_REASONS } from "../labels";
import {
  type CancelAppointmentInput,
  cancelAppointmentSchema,
} from "../schemas";
import type { Appointment, CancellationActor } from "../types";

export type CancelledAppointmentDetails = {
  reason: string;
  isLateCancellation: boolean;
};

type CancelAppointmentDialogProps = {
  appointment: Pick<
    Appointment,
    "id" | "startsAt" | "patientName" | "priceCents"
  > | null;
  actor: CancellationActor;
  cancellationNoticeHours: number;
  onOpenChange: (isOpen: boolean) => void;
  onCancelled: (details: CancelledAppointmentDetails) => void;
};

export function CancelAppointmentDialog({
  appointment,
  actor,
  cancellationNoticeHours,
  onOpenChange,
  onCancelled,
}: CancelAppointmentDialogProps) {
  const cancelAppointmentMutation = useCancelAppointmentMutation();
  const form = useForm<CancelAppointmentInput>({
    resolver: zodResolver(cancelAppointmentSchema),
    defaultValues: { details: "" },
  });

  const isLate =
    appointment !== null &&
    isLateCancellation(appointment.startsAt, cancellationNoticeHours);
  const isPatient = actor === "patient";

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) form.reset();
    onOpenChange(isOpen);
  }

  const handleSubmit = form.handleSubmit((input) => {
    if (!appointment) return;
    cancelAppointmentMutation.mutate(
      { appointmentId: appointment.id, input },
      {
        onSuccess: ({ reason }) => {
          toast.success("Sessão cancelada.");
          onCancelled({ reason, isLateCancellation: isLate });
          handleOpenChange(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  });

  return (
    <FormDialog
      isOpen={appointment !== null}
      onOpenChange={handleOpenChange}
      title="Cancelar sessão"
      description={
        appointment
          ? `${isPatient ? "Sua sessão" : `Sessão de ${appointment.patientName}`} em ${formatDateTime(appointment.startsAt)}.`
          : undefined
      }
      submitLabel="Cancelar sessão"
      isSubmitting={cancelAppointmentMutation.isPending}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-5">
        {isLate && (
          <Alert>
            <TriangleAlert aria-hidden />
            <AlertDescription>
              {isPatient
                ? `Faltam menos de ${cancellationNoticeHours}h para a sessão. Pela política do consultório, o valor de ${appointment ? formatCurrency(appointment.priceCents) : ""} será cobrado.`
                : `Cancelamento com menos de ${cancellationNoticeHours}h de antecedência. Avise o paciente pelo WhatsApp.`}
            </AlertDescription>
          </Alert>
        )}
        <SelectField
          control={form.control}
          name="reasonCategory"
          label="Motivo"
          placeholder="Selecione o motivo"
          options={CANCELLATION_REASONS}
        />
        <TextareaField
          control={form.control}
          name="details"
          label="Conte o que aconteceu"
          placeholder={
            isPatient
              ? "Ex.: tive um imprevisto no trabalho e não vou conseguir chegar a tempo."
              : "Ex.: precisarei remarcar por causa de um compromisso clínico."
          }
          description="Esse texto fica registrado no histórico da sessão."
        />
      </div>
    </FormDialog>
  );
}
