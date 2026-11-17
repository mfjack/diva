"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormDialog } from "@/components/dialog/form-dialog";
import { DateField } from "@/components/form/date-field";
import { MaskedField } from "@/components/form/masked-field";
import { NumberField } from "@/components/form/number-field";
import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { TextareaField } from "@/components/form/textarea-field";
import { APPOINTMENT_MODALITY_OPTIONS } from "@/features/appointments/labels";
import { useSavePatientMutation } from "../hooks/use-save-patient-mutation";
import {
  EMPTY_PATIENT_INPUT,
  type PatientInput,
  patientSchema,
} from "../schemas";
import type { PatientId } from "../types";

type PatientFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  patientId: PatientId | null;
  defaultValues?: Partial<PatientInput>;
};

export function PatientFormDialog({
  isOpen,
  onOpenChange,
  patientId,
  defaultValues = EMPTY_PATIENT_INPUT,
}: PatientFormDialogProps) {
  const savePatientMutation = useSavePatientMutation();
  const form = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
    defaultValues,
  });

  function handleOpenChange(nextIsOpen: boolean) {
    if (!nextIsOpen) form.reset(EMPTY_PATIENT_INPUT);
    onOpenChange(nextIsOpen);
  }

  const handleSubmit = form.handleSubmit((input) => {
    savePatientMutation.mutate(
      { patientId, input },
      {
        onSuccess: () => {
          toast.success(
            patientId ? "Paciente atualizado." : "Paciente cadastrado.",
          );
          handleOpenChange(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  });

  return (
    <FormDialog
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      title={patientId ? "Editar paciente" : "Novo paciente"}
      submitLabel={patientId ? "Salvar" : "Cadastrar"}
      isSubmitting={savePatientMutation.isPending}
      onSubmit={handleSubmit}
      size="large"
    >
      <div className="flex flex-col gap-6">
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 font-medium text-sm">Dados pessoais</legend>
          <div className="sm:col-span-2">
            <TextField
              control={form.control}
              name="fullName"
              label="Nome completo"
              placeholder="Ex.: Mariana Costa"
              autoComplete="off"
            />
          </div>
          <TextField
            control={form.control}
            name="email"
            label="E-mail"
            type="email"
            placeholder="nome@email.com"
            autoComplete="off"
          />
          <MaskedField
            control={form.control}
            name="phone"
            label="WhatsApp"
            mask="phone"
            placeholder="(11) 98765-4321"
          />
          <MaskedField
            control={form.control}
            name="cpf"
            label="CPF"
            mask="cpf"
            placeholder="000.000.000-00"
            description="Usado nos recibos para reembolso e IR."
          />
          <DateField
            control={form.control}
            name="birthDate"
            label="Data de nascimento"
            allowedDates="up-to-today"
          />
        </fieldset>

        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 font-medium text-sm">Atendimento</legend>
          <NumberField
            control={form.control}
            name="sessionPrice"
            label="Valor da sessão"
            format="currency"
            placeholder="Valor padrão do consultório"
            description="Deixe em branco para usar o valor padrão."
          />
          <SelectField
            control={form.control}
            name="preferredModality"
            label="Modalidade de atendimento"
            placeholder="Presencial ou online"
            options={APPOINTMENT_MODALITY_OPTIONS}
            description="Usada automaticamente ao agendar as sessões."
          />
          <TextField
            control={form.control}
            name="healthInsurance"
            label="Plano de saúde"
            placeholder="Ex.: SulAmérica (reembolso)"
          />
          <TextField
            control={form.control}
            name="emergencyContactName"
            label="Contato de emergência"
            placeholder="Nome e parentesco"
          />
          <MaskedField
            control={form.control}
            name="emergencyContactPhone"
            label="Telefone de emergência"
            mask="phone"
            placeholder="(11) 98765-4321"
          />
          <div className="sm:col-span-2">
            <TextareaField
              control={form.control}
              name="notes"
              label="Observações"
              placeholder="Preferências de horário, combinados, etc."
            />
          </div>
        </fieldset>
      </div>
    </FormDialog>
  );
}
