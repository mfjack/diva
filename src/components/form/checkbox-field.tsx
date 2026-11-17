"use client";

import { type ReactNode, useId } from "react";
import { Controller, type FieldValues } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import type { FormFieldProps } from "./form-field-types";

type CheckboxFieldProps<TFieldValues extends FieldValues> = Pick<
  FormFieldProps<TFieldValues>,
  "control" | "name"
> & {
  label: ReactNode;
};

export function CheckboxField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
}: CheckboxFieldProps<TFieldValues>) {
  const inputId = useId();
  const errorId = `${inputId}-error`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field>
          <div className="flex items-start gap-3">
            <Checkbox
              id={inputId}
              ref={field.ref}
              checked={field.value === true}
              onCheckedChange={field.onChange}
              aria-invalid={fieldState.invalid}
              aria-describedby={fieldState.error ? errorId : undefined}
              className="mt-0.5"
            />
            <FieldLabel htmlFor={inputId} className="font-normal leading-snug">
              {label}
            </FieldLabel>
          </div>
          {fieldState.error && (
            <FieldError
              id={errorId}
              errors={[fieldState.error]}
              className="text-[0.6875rem]"
            />
          )}
        </Field>
      )}
    />
  );
}
