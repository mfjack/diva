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
  listAvailableTimes,
  type SessionAvailability,
} from "@/features/practice-settings/availability";

type AvailableTimeFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  dateKey: string;
  availability: SessionAvailability;
};

export function AvailableTimeField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  dateKey,
  availability,
}: AvailableTimeFieldProps<TFieldValues>) {
  const { field } = useController({ control, name });
  const availableTimes = useMemo(
    () => (dateKey ? listAvailableTimes(availability, dateKey) : []),
    [availability, dateKey],
  );

  useEffect(() => {
    if (field.value && !availableTimes.includes(field.value)) {
      field.onChange("" as PathValue<TFieldValues, typeof name>);
    }
  }, [availableTimes, field]);

  return (
    <TimeField
      control={control}
      name={name}
      label={label}
      times={availableTimes}
      emptyMessage={
        dateKey
          ? "Você não atende nesse dia. Ajuste em Configurações."
          : "Escolha a data para ver os horários."
      }
    />
  );
}
