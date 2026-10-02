"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { useSaveWeeklyAvailabilityMutation } from "@/features/practice-settings/hooks/use-save-weekly-availability-mutation";
import { WEEKDAY_LABELS, WEEKDAYS } from "@/features/practice-settings/labels";
import {
  ANY_MODALITY,
  AVAILABILITY_MODALITY_OPTIONS,
  type WeeklyAvailabilityInput,
  weeklyAvailabilitySchema,
} from "@/features/practice-settings/schemas";
import type {
  AvailabilityRule,
  Weekday,
} from "@/features/practice-settings/types";
import { SettingsCard } from "./settings-card";

const DEFAULT_START_TIME = "08:00";
const DEFAULT_END_TIME = "12:00";

type WeeklyAvailabilityFormProps = {
  rules: AvailabilityRule[];
};

function toWeeklyAvailabilityInput(
  rules: AvailabilityRule[],
): WeeklyAvailabilityInput {
  return {
    intervals: rules.map(({ weekday, startTime, endTime, modality }) => ({
      weekday,
      startTime,
      endTime,
      modality: modality ?? ANY_MODALITY,
    })),
  };
}

export function WeeklyAvailabilityForm({ rules }: WeeklyAvailabilityFormProps) {
  const saveAvailabilityMutation = useSaveWeeklyAvailabilityMutation();
  const form = useForm<WeeklyAvailabilityInput>({
    resolver: zodResolver(weeklyAvailabilitySchema),
    defaultValues: toWeeklyAvailabilityInput(rules),
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "intervals",
  });

  function addInterval(weekday: Weekday) {
    append({
      weekday,
      startTime: DEFAULT_START_TIME,
      endTime: DEFAULT_END_TIME,
      modality: ANY_MODALITY,
    });
  }

  const handleSubmit = form.handleSubmit((input) => {
    saveAvailabilityMutation.mutate(input, {
      onSuccess: () => {
        form.reset(input);
        toast.success("Horários salvos.");
      },
      onError: (error) => toast.error(error.message),
    });
  });

  return (
    <SettingsCard
      title="Horários de atendimento"
      description="Os pacientes só veem horários livres dentro desses períodos."
      isSubmitting={saveAvailabilityMutation.isPending}
      onSubmit={handleSubmit}
    >
      <ul className="flex flex-col divide-y">
        {WEEKDAYS.map((weekday) => {
          const dayFields = fields
            .map((field, index) => ({ field, index }))
            .filter(({ field }) => field.weekday === weekday);

          return (
            <li
              key={weekday}
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 md:flex-row md:items-start md:gap-6"
            >
              <div className="flex items-center justify-between md:h-12 md:w-40 md:shrink-0">
                <span className="font-medium">{WEEKDAY_LABELS[weekday]}</span>
                {dayFields.length === 0 && (
                  <span className="text-muted-foreground text-sm md:hidden">
                    Sem atendimento
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3">
                {dayFields.length === 0 && (
                  <span className="hidden h-12 items-center text-muted-foreground text-sm md:flex">
                    Sem atendimento
                  </span>
                )}
                {dayFields.map(({ field, index }) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-[1fr_1fr_auto] items-start gap-2 sm:grid-cols-[8rem_8rem_1fr_auto]"
                  >
                    <TextField
                      control={form.control}
                      name={`intervals.${index}.startTime`}
                      label={`Início, ${WEEKDAY_LABELS[weekday]}`}
                      isLabelHidden
                      type="time"
                    />
                    <TextField
                      control={form.control}
                      name={`intervals.${index}.endTime`}
                      label={`Fim, ${WEEKDAY_LABELS[weekday]}`}
                      isLabelHidden
                      type="time"
                    />
                    <div className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto">
                      <SelectField
                        control={form.control}
                        name={`intervals.${index}.modality`}
                        label={`Modalidade, ${WEEKDAY_LABELS[weekday]}`}
                        isLabelHidden
                        options={AVAILABILITY_MODALITY_OPTIONS}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="col-start-3 row-start-1 size-12 text-muted-foreground sm:col-start-4"
                      aria-label={`Remover horário de ${WEEKDAY_LABELS[weekday]}`}
                      onClick={() => remove(index)}
                    >
                      <Trash2 aria-hidden />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  className="w-fit px-2 text-muted-foreground"
                  onClick={() => addInterval(weekday)}
                >
                  <Plus aria-hidden />
                  Adicionar período
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </SettingsCard>
  );
}
