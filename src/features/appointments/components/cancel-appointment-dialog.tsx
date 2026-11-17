"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TriangleAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormDialog } from "@/components/dialog/form-dialog";
import { RadioGroupField } from "@/components/form/radio-group-field";
import { SelectField } from "@/components/form/select-field";
import { TextareaField } from "@/components/form/textarea-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDateTime } from "@/lib/format";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { isLateCancellation } from "../cancellation-policy";
import { useCancelAppointmentMutation } from "../hooks/use-cancel-appointment-mutation";
import { CANCELLATION_REASONS, CANCELLATION_SCOPE_OPTIONS } from "../labels";
import {
  type CancelAppointmentInput,
  cancelAppointmentSchema,
} from "../schemas";
import type { Appointment } from "../types";

type CancelAppointmentDialogProps = {
  appointment: Pick<
    Appointment,
    "id" | "startsAt" | "patientName" | "seriesId"
  > | null;
  patientPhone: string | null;
  cancellationNoticeHours: number;
  onOpenChange: (isOpen: boolean) => void;
};

export function CancelAppointmentDialog({
  appointment,
  patientPhone,
  cancellationNoticeHours,
  onOpenChange,
}: CancelAppointmentDialogProps) {
  const cancelAppointmentMutation = useCancelAppointmentMutation();
  const form = useForm<CancelAppointmentInput>({
    resolver: zodResolver(cancelAppointmentSchema),
    defaultValues: { scope: "single", details: "" },
  });

  const isLate =
    appointment !== null &&
    isLateCancellation(appointment.startsAt, cancellationNoticeHours);

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) form.reset();
    onOpenChange(isOpen);
  }

  const handleSubmit = form.handleSubmit((input) => {
    if (!appointment) return;
    cancelAppointmentMutation.mutate(
      { appointmentId: appointment.id, input },
      {
        onSuccess: ({ cancelledCount }) => {
          toast.success(
            cancelledCount === 1
              ? "Sessão cancelada."
              : `${cancelledCount} sessões canceladas.`,
          );
          if (patientPhone) {
            window.open(
              getWhatsAppUrl(patientPhone, input.details),
              "_blank",
              "noopener,noreferrer",
            );
          }
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
          ? `Sessão de ${appointment.patientName} em ${formatDateTime(appointment.startsAt)}.`
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
              {`Cancelamento com menos de ${cancellationNoticeHours}h de antecedência. Avise o paciente pelo WhatsApp.`}
            </AlertDescription>
          </Alert>
        )}
        {appointment?.seriesId && (
          <RadioGroupField
            control={form.control}
            name="scope"
            label="O que cancelar"
            options={CANCELLATION_SCOPE_OPTIONS}
          />
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
          label="Mensagem para o paciente"
          placeholder="Ex.: Oi! Precisei cancelar nossa sessão de amanhã. Vamos remarcar?"
          description={
            patientPhone
              ? "Ao cancelar, o WhatsApp abre com essa mensagem pronta para enviar. Ela também fica no histórico da sessão."
              : "O paciente não tem WhatsApp cadastrado. A mensagem fica só no histórico da sessão."
          }
        />
      </div>
    </FormDialog>
  );
}
