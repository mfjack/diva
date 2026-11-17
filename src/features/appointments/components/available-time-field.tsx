"use client";

import { useEffect, useMemo } from "react";
import {
  type Control,
  type FieldPath,
  type FieldValues,
  type PathValue,
  useController,
} from "react-hook-form";
import { TimeField } from "@/components/form/time-field";
import {
  excludeOccupiedTimes,
  listAvailableTimes,
  type SessionAvailability,
} from "@/features/practice-settings/availability";
import { useBusyIntervalsQuery } from "../hooks/use-busy-intervals-query";

type AvailableTimeFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  dateKey: string;
  availability: SessionAvailability;
  ignoredAppointmentId?: string;
};

function getEmptyMessage(dateKey: string, hasWorkingHours: boolean): string {
  if (!dateKey) return "Escolha a data para ver os horários.";
  if (!hasWorkingHours) {
    return "Você não atende nesse dia. Ajuste em Configurações.";
  }
  return "Todos os horários desse dia já estão ocupados.";
}

export function AvailableTimeField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  dateKey,
  availability,
  ignoredAppointmentId,
}: AvailableTimeFieldProps<TFieldValues>) {
  const { field } = useController({ control, name });
  const busyIntervalsQuery = useBusyIntervalsQuery(
    dateKey ? { date: dateKey, ignoredAppointmentId } : null,
  );
  const workingTimes = useMemo(
    () => (dateKey ? listAvailableTimes(availability, dateKey) : []),
    [availability, dateKey],
  );
  const freeTimes = useMemo(
    () =>
      excludeOccupiedTimes(
        workingTimes,
        dateKey,
        availability.sessionDurationMinutes,
        busyIntervalsQuery.data ?? [],
      ),
    [
      workingTimes,
      dateKey,
      availability.sessionDurationMinutes,
      busyIntervalsQuery.data,
    ],
  );

  useEffect(() => {
    if (field.value && !freeTimes.includes(field.value)) {
      field.onChange("" as PathValue<TFieldValues, typeof name>);
    }
  }, [freeTimes, field]);

  return (
    <TimeField
      control={control}
      name={name}
      label={label}
      times={freeTimes}
      emptyMessage={getEmptyMessage(dateKey, workingTimes.length > 0)}
    />
  );
}
