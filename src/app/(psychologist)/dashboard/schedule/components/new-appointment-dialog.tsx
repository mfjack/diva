"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormDialog } from "@/components/dialog/form-dialog";
import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { useCreateAppointmentMutation } from "@/features/appointments/hooks/use-create-appointment-mutation";
import { APPOINTMENT_MODALITY_LABELS } from "@/features/appointments/labels";
import {
  type CreateAppointmentInput,
  createAppointmentSchema,
} from "@/features/appointments/schemas";
import type { Patient } from "@/features/patients/types";

const MODALITY_OPTIONS = Object.entries(APPOINTMENT_MODALITY_LABELS).map(
  ([value, label]) => ({ value, label }),
);

type NewAppointmentDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  patients: Patient[];
};

export function NewAppointmentDialog({
  isOpen,
  onOpenChange,
  patients,
}: NewAppointmentDialogProps) {
  const createAppointmentMutation = useCreateAppointmentMutation();
  const form = useForm<CreateAppointmentInput>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: { date: "", time: "" },
  });

  const patientOptions = useMemo(
    () =>
      patients
        .filter(({ status }) => status === "active")
        .map(({ id, fullName }) => ({ value: id, label: fullName })),
    [patients],
  );

  function handleOpenChange(nextIsOpen: boolean) {
    if (!nextIsOpen) form.reset();
    onOpenChange(nextIsOpen);
  }

  const handleSubmit = form.handleSubmit((input) => {
    createAppointmentMutation.mutate(input, {
      onSuccess: () => {
        toast.success("Sessão agendada.");
        handleOpenChange(false);
      },
      onError: (error) => toast.error(error.message),
    });
  });

  return (
    <FormDialog
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      title="Nova sessão"
      description="O paciente recebe a confirmação por e-mail."
      submitLabel="Agendar"
      isSubmitting={createAppointmentMutation.isPending}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-5">
        <SelectField
          control={form.control}
          name="patientId"
          label="Paciente"
          placeholder="Selecione o paciente"
          options={patientOptions}
        />
        <div className="grid grid-cols-2 gap-4">
          <TextField
            control={form.control}
            name="date"
            label="Data"
            type="date"
          />
          <TextField
            control={form.control}
            name="time"
            label="Horário"
            type="time"
          />
        </div>
        <SelectField
          control={form.control}
          name="modality"
          label="Modalidade"
          placeholder="Presencial ou online"
          options={MODALITY_OPTIONS}
        />
      </div>
    </FormDialog>
  );
}
