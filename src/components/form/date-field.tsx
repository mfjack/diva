"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { useId, useState } from "react";
import type { Matcher } from "react-day-picker";
import { ptBR as calendarLocale } from "react-day-picker/locale";
import { Controller, type FieldValues } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { dateKeyToLocalDate, localDateToDateKey, toDateKey } from "@/lib/dates";
import { FormFieldShell, getFieldDescriptionId } from "./form-field-shell";
import type { FormFieldProps } from "./form-field-types";
import { PickerTrigger } from "./picker-trigger";

type AllowedDates = "any" | "today-onwards" | "up-to-today";

const FIRST_SELECTABLE_YEAR = 1920;

type DateFieldProps<TFieldValues extends FieldValues> = Omit<
  FormFieldProps<TFieldValues>,
  "autoComplete"
> & {
  allowedDates?: AllowedDates;
};

function getDisabledDates(allowedDates: AllowedDates): Matcher | undefined {
  const today = dateKeyToLocalDate(toDateKey(new Date()));
  if (allowedDates === "today-onwards") return { before: today };
  if (allowedDates === "up-to-today") return { after: today };
  return undefined;
}

function formatDisplayDate(dateKey: string): string {
  return format(dateKeyToLocalDate(dateKey), "EEEEEE, d 'de' MMM 'de' yyyy", {
    locale: ptBR,
  });
}

export function DateField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  labelAction,
  isLabelHidden,
  placeholder = "Escolha a data",
  allowedDates = "any",
}: DateFieldProps<TFieldValues>) {
  const inputId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const isPastOnly = allowedDates === "up-to-today";

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selectedDate = field.value
          ? dateKeyToLocalDate(field.value)
          : undefined;

        function handleSelect(date: Date | undefined) {
          field.onChange(date ? localDateToDateKey(date) : "");
          setIsOpen(false);
        }

        return (
          <FormFieldShell
            inputId={inputId}
            label={label}
            description={description}
            labelAction={labelAction}
            isLabelHidden={isLabelHidden}
            error={fieldState.error}
          >
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger
                render={
                  <PickerTrigger
                    id={inputId}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    icon={CalendarDays}
                    displayValue={
                      field.value ? formatDisplayDate(field.value) : null
                    }
                    placeholder={placeholder}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={getFieldDescriptionId(inputId)}
                  />
                }
              />
              <PopoverContent align="start" className="w-auto p-2">
                <Calendar
                  mode="single"
                  locale={calendarLocale}
                  selected={selectedDate}
                  defaultMonth={selectedDate}
                  onSelect={handleSelect}
                  disabled={getDisabledDates(allowedDates)}
                  captionLayout={isPastOnly ? "dropdown" : "label"}
                  startMonth={
                    isPastOnly ? new Date(FIRST_SELECTABLE_YEAR, 0) : undefined
                  }
                  endMonth={isPastOnly ? new Date() : undefined}
                  className="[--cell-size:--spacing(9)]"
                />
              </PopoverContent>
            </Popover>
          </FormFieldShell>
        );
      }}
    />
  );
}
