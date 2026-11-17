"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FormDialog } from "@/components/dialog/form-dialog";
import { DateField } from "@/components/form/date-field";
import { SelectField } from "@/components/form/select-field";
import type { CreatedSessionsSummary } from "@/features/appointments/actions";
import { AvailableTimeField } from "@/features/appointments/components/available-time-field";
import { useCreateAppointmentMutation } from "@/features/appointments/hooks/use-create-appointment-mutation";
import { useSessionPlanQuery } from "@/features/appointments/hooks/use-session-plan-query";
import { SESSION_REPEAT_OPTIONS } from "@/features/appointments/labels";
import { listBookableSessions } from "@/features/appointments/recurring-sessions";
import {
  type CreateAppointmentInput,
  createAppointmentSchema,
  sessionPlanSchema,
} from "@/features/appointments/schemas";
import type { Patient } from "@/features/patients/types";
import type { SessionAvailability } from "@/features/practice-settings/availability";
import { formatDateKey } from "@/lib/dates";
import { countSessionsLabel, SessionPlanPreview } from "./session-plan-preview";

const EMPTY_APPOINTMENT_INPUT: Partial<CreateAppointmentInput> = {
  date: "",
  time: "",
  repeat: "none",
  excludedDates: [],
};

function getCreatedMessage({
  createdCount,
  skippedSessions,
}: CreatedSessionsSummary): { title: string; description?: string } {
  const title =
    createdCount === 1
      ? "Sessão agendada."
      : `${countSessionsLabel(createdCount)} agendadas.`;
  if (skippedSessions.length === 0) return { title };
  const skippedDates = skippedSessions
    .map(({ dateKey }) => formatDateKey(dateKey).slice(0, 5))
    .join(", ");
  return { title, description: `Datas puladas: ${skippedDates}.` };
}

type NewAppointmentDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  patients: Patient[];
  availability: SessionAvailability;
};

export function NewAppointmentDialog({
  isOpen,
  onOpenChange,
  patients,
  availability,
}: NewAppointmentDialogProps) {
  const createAppointmentMutation = useCreateAppointmentMutation();
  const form = useForm<CreateAppointmentInput>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: EMPTY_APPOINTMENT_INPUT,
  });
  const [date, time, repeat, excludedDates] = useWatch({
    control: form.control,
    name: ["date", "time", "repeat", "excludedDates"],
  });
  const isRepeating = repeat !== "none";

  useEffect(() => {
    if (date || time || repeat) form.setValue("excludedDates", []);
  }, [date, time, repeat, form]);

  const planInput = useMemo(() => {
    if (!isRepeating) return null;
    const parsedPlan = sessionPlanSchema.safeParse({ date, time, repeat });
    return parsedPlan.success ? parsedPlan.data : null;
  }, [isRepeating, date, time, repeat]);
  const sessionPlanQuery = useSessionPlanQuery(planInput);
  const plannedSessions = planInput ? sessionPlanQuery.data : undefined;
  const bookableCount = plannedSessions
    ? listBookableSessions(plannedSessions, excludedDates).length
    : undefined;

  function handleToggleDate(dateKey: string) {
    const currentDates = form.getValues("excludedDates");
    form.setValue(
      "excludedDates",
      currentDates.includes(dateKey)
        ? currentDates.filter((excludedDate) => excludedDate !== dateKey)
        : [...currentDates, dateKey],
    );
  }

  const patientOptions = useMemo(
    () =>
      patients
        .filter(({ status }) => status === "active")
        .map(({ id, fullName }) => ({ value: id, label: fullName })),
    [patients],
  );

  function handleOpenChange(nextIsOpen: boolean) {
    if (!nextIsOpen) form.reset(EMPTY_APPOINTMENT_INPUT);
    onOpenChange(nextIsOpen);
  }

  const handleSubmit = form.handleSubmit((input) => {
    createAppointmentMutation.mutate(input, {
      onSuccess: (summary) => {
        const { title, description } = getCreatedMessage(summary);
        toast.success(title, { description });
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
      description="A sessão entra na agenda já confirmada."
      submitLabel={
        isRepeating && bookableCount !== undefined && bookableCount > 0
          ? `Agendar ${countSessionsLabel(bookableCount)}`
          : "Agendar"
      }
      isSubmitting={createAppointmentMutation.isPending}
      onSubmit={handleSubmit}
      size="medium"
    >
      <div className="flex flex-col gap-5">
        <SelectField
          control={form.control}
          name="patientId"
          label="Paciente"
          placeholder="Selecione o paciente"
          options={patientOptions}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <DateField
            control={form.control}
            name="date"
            label={isRepeating ? "Primeira sessão" : "Data"}
            allowedDates="today-onwards"
          />
          <AvailableTimeField
            control={form.control}
            name="time"
            label="Horário"
            dateKey={date}
            availability={availability}
          />
        </div>
        <SelectField
          control={form.control}
          name="repeat"
          label="Repetir"
          options={SESSION_REPEAT_OPTIONS}
          description={
            isRepeating ? "Até o fim do mês da primeira sessão." : undefined
          }
        />
        {isRepeating && (
          <SessionPlanPreview
            sessions={plannedSessions}
            excludedDates={excludedDates}
            onToggleDate={handleToggleDate}
            isLoading={sessionPlanQuery.isFetching}
          />
        )}
      </div>
    </FormDialog>
  );
}
