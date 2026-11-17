"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { NumberField } from "@/components/form/number-field";
import { TextField } from "@/components/form/text-field";
import { TextareaField } from "@/components/form/textarea-field";
import { useSavePracticeSettingsMutation } from "@/features/practice-settings/hooks/use-save-practice-settings-mutation";
import {
  type PracticeSettingsInput,
  practiceSettingsSchema,
} from "@/features/practice-settings/schemas";
import type { PracticeSettings } from "@/features/practice-settings/types";
import { fromCents } from "@/lib/money";
import { SettingsCard } from "./settings-card";

type PracticeSettingsFormProps = {
  settings: PracticeSettings;
};

function toPracticeSettingsInput(
  settings: PracticeSettings,
): PracticeSettingsInput {
  return {
    psychologistName: settings.psychologistName,
    professionalRegistration: settings.professionalRegistration,
    sessionDurationMinutes: settings.sessionDurationMinutes,
    defaultSessionPrice: fromCents(settings.defaultSessionPriceCents),
    cancellationNoticeHours: settings.cancellationNoticeHours,
    bookingWindowDays: settings.bookingWindowDays,
    minimumBookingNoticeHours: settings.minimumBookingNoticeHours,
    pixKey: settings.pixKey ?? "",
    officeAddress: settings.officeAddress ?? "",
    bio: settings.bio ?? "",
  };
}

export function PracticeSettingsForm({ settings }: PracticeSettingsFormProps) {
  const saveSettingsMutation = useSavePracticeSettingsMutation();
  const form = useForm<PracticeSettingsInput>({
    resolver: zodResolver(practiceSettingsSchema),
    defaultValues: toPracticeSettingsInput(settings),
  });

  const handleSubmit = form.handleSubmit((input) => {
    saveSettingsMutation.mutate(input, {
      onSuccess: () => {
        form.reset(input);
        toast.success("Configurações salvas.");
      },
      onError: (error) => toast.error(error.message),
    });
  });

  return (
    <SettingsCard
      title="Atendimento"
      description="Esses dados aparecem para o paciente na hora de agendar e nos recibos."
      isSubmitting={saveSettingsMutation.isPending}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <TextField
            control={form.control}
            name="psychologistName"
            label="Nome"
            placeholder="Seu nome"
            description="Aparece no menu, nos recibos e nos documentos."
          />
        </div>
        <TextField
          control={form.control}
          name="professionalRegistration"
          label="Registro profissional"
          placeholder="CRP 06/123456"
        />
        <NumberField
          control={form.control}
          name="defaultSessionPrice"
          label="Valor padrão da sessão"
          format="currency"
          placeholder="$ 0,00"
          description="Cada paciente pode ter um valor próprio."
        />
        <NumberField
          control={form.control}
          name="sessionDurationMinutes"
          label="Duração da sessão"
          format="integer"
          suffix="min"
          placeholder="50 min"
        />
        <NumberField
          control={form.control}
          name="cancellationNoticeHours"
          label="Cancelamento sem cobrança até"
          format="integer"
          suffix="h antes"
          placeholder="24h antes"
          description="Depois disso, a sessão cancelada é cobrada."
        />
        <NumberField
          control={form.control}
          name="minimumBookingNoticeHours"
          label="Antecedência mínima para agendar"
          format="integer"
          suffix="h"
          placeholder="2h"
        />
        <NumberField
          control={form.control}
          name="bookingWindowDays"
          label="Agenda aberta para os próximos"
          format="integer"
          suffix="dias"
          placeholder="30 dias"
        />
        <TextField
          control={form.control}
          name="pixKey"
          label="Chave Pix"
          placeholder="E-mail, CPF, telefone ou chave aleatória"
        />
        <TextField
          control={form.control}
          name="officeAddress"
          label="Endereço do consultório"
          placeholder="Rua, número, sala, bairro e cidade"
        />
        <div className="md:col-span-2">
          <TextareaField
            control={form.control}
            name="bio"
            label="Apresentação"
            placeholder="Sua abordagem, público atendido e formação."
            description="Aparece para o paciente na página de agendamento."
          />
        </div>
      </div>
    </SettingsCard>
  );
}
