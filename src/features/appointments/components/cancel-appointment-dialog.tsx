"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TriangleAlert } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FormDialog } from "@/components/dialog/form-dialog";
import { RadioGroupField } from "@/components/form/radio-group-field";
import { SelectField } from "@/components/form/select-field";
import { TextareaField } from "@/components/form/textarea-field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDateTime } from "@/lib/format";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { isLateCancellation } from "../cancellation-policy";
import { useCancelAppointmentMutation } from "../hooks/use-cancel-appointment-mutation";
import {
  CANCELLATION_REASONS,
  CANCELLATION_REQUESTER_OPTIONS,
  CANCELLATION_SCOPE_OPTIONS,
} from "../labels";
import {
  type CancelAppointmentInput,
  cancelAppointmentSchema,
} from "../schemas";
import type { Appointment, CancellationActor } from "../types";

type CancellationDetailsCopy = {
  label: string;
  placeholder: string;
  description: string;
};

const HISTORY_ONLY_DESCRIPTION = "Fica só no histórico da sessão.";

function getDetailsCopy(
  cancelledBy: CancellationActor | undefined,
  hasPatientPhone: boolean,
): CancellationDetailsCopy {
  if (cancelledBy === "patient") {
    return {
      label: "O que o paciente disse",
      placeholder: "Ex.: Avisou que está com febre e não vai conseguir vir.",
      description: HISTORY_ONLY_DESCRIPTION,
    };
  }
  if (cancelledBy === "psychologist") {
    return {
      label: "Mensagem para o paciente",
      placeholder:
        "Ex.: Oi! Precisei cancelar nossa sessão de amanhã. Vamos remarcar?",
      description: hasPatientPhone
        ? "Ao cancelar, o WhatsApp abre com essa mensagem pronta para enviar. Ela também fica no histórico da sessão."
        : "O paciente não tem WhatsApp cadastrado. A mensagem fica só no histórico da sessão.",
    };
  }
  return {
    label: "Detalhes",
    placeholder: "Conte o que aconteceu.",
    description: HISTORY_ONLY_DESCRIPTION,
  };
}

function getLateCancellationMessage(
  cancelledBy: CancellationActor | undefined,
  cancellationNoticeHours: number,
): string {
  return cancelledBy === "patient"
    ? `Pedido com menos de ${cancellationNoticeHours}h de antecedência. Fica registrado como cancelamento em cima da hora.`
    : `Faltam menos de ${cancellationNoticeHours}h para a sessão. Avise o paciente pelo WhatsApp.`;
}

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

  const cancelledBy = useWatch({ control: form.control, name: "cancelledBy" });
  const detailsCopy = getDetailsCopy(cancelledBy, patientPhone !== null);

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
          if (patientPhone && input.cancelledBy === "psychologist") {
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
          <Alert variant="warning">
            <TriangleAlert aria-hidden />
            <AlertTitle>Cancelamento em cima da hora</AlertTitle>
            <AlertDescription>
              {getLateCancellationMessage(cancelledBy, cancellationNoticeHours)}
            </AlertDescription>
          </Alert>
        )}
        <RadioGroupField
          control={form.control}
          name="cancelledBy"
          label="Quem pediu o cancelamento"
          options={CANCELLATION_REQUESTER_OPTIONS}
        />
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
          label={detailsCopy.label}
          placeholder={detailsCopy.placeholder}
          description={detailsCopy.description}
        />
      </div>
    </FormDialog>
  );
}
