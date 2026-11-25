"use client";

import { Clock } from "lucide-react";
import { useId, useState } from "react";
import { Controller, type FieldValues } from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  buildTimeSlots,
  DEFAULT_TIME_SLOT_OPTIONS,
  groupTimeSlotsByPeriod,
} from "@/lib/time-slots";
import { cn } from "@/lib/utils";
import { FormFieldShell, getFieldDescriptionId } from "./form-field-shell";
import type { FormFieldProps } from "./form-field-types";
import { PickerTrigger } from "./picker-trigger";

type TimeFieldProps<TFieldValues extends FieldValues> = Omit<
  FormFieldProps<TFieldValues>,
  "autoComplete"
> & {
  times?: readonly string[];
  emptyMessage?: string;
};

type TimeOptionProps = {
  time: string;
  isSelected: boolean;
  onSelect: (time: string) => void;
};

function TimeOption({ time, isSelected, onSelect }: TimeOptionProps) {
  function handleClick() {
    onSelect(time);
  }

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={handleClick}
      className={cn(
        "h-9 rounded-md text-sm tabular-nums transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring",
        isSelected &&
          "bg-primary font-medium text-primary-foreground hover:bg-primary",
      )}
    >
      {time}
    </button>
  );
}

export function TimeField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  labelAction,
  isLabelHidden,
  placeholder = "Escolha o horário",
  times,
  emptyMessage = "Nenhum horário disponível.",
}: TimeFieldProps<TFieldValues>) {
  const inputId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const timeGroups = groupTimeSlotsByPeriod(
    times ?? buildTimeSlots(DEFAULT_TIME_SLOT_OPTIONS),
  );

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        function handleSelect(time: string) {
          field.onChange(time);
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
                    icon={Clock}
                    displayValue={field.value || null}
                    placeholder={placeholder}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={getFieldDescriptionId(inputId)}
                  />
                }
              />
              <PopoverContent
                align="start"
                aria-label={label}
                className="max-h-80 w-72 gap-4 overflow-y-auto p-3"
              >
                {timeGroups.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    {emptyMessage}
                  </p>
                )}
                {timeGroups.map((group) => (
                  <div key={group.period} className="flex flex-col gap-2">
                    <span className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
                      {group.label}
                    </span>
                    <div role="listbox" className="grid grid-cols-4 gap-1">
                      {group.times.map((time) => (
                        <TimeOption
                          key={time}
                          time={time}
                          isSelected={field.value === time}
                          onSelect={handleSelect}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          </FormFieldShell>
        );
      }}
    />
  );
}
