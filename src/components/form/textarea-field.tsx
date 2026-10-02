"use client";

import { useId } from "react";
import { Controller, type FieldValues } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FormFieldShell, getFieldDescriptionId } from "./form-field-shell";
import { FORM_INPUT_CLASS_NAME } from "./form-field-styles";
import type { FormFieldProps } from "./form-field-types";

const TEXTAREA_SIZE_CLASS_NAMES = {
  default: "min-h-20",
  large: "min-h-96 leading-relaxed",
} as const;

type TextareaFieldProps<TFieldValues extends FieldValues> =
  FormFieldProps<TFieldValues> & {
    size?: keyof typeof TEXTAREA_SIZE_CLASS_NAMES;
  };

export function TextareaField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  labelAction,
  isLabelHidden,
  placeholder,
  autoComplete,
  size = "default",
}: TextareaFieldProps<TFieldValues>) {
  const inputId = useId();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormFieldShell
          inputId={inputId}
          label={label}
          description={description}
          labelAction={labelAction}
          isLabelHidden={isLabelHidden}
          error={fieldState.error}
        >
          <Textarea
            {...field}
            value={field.value ?? ""}
            id={inputId}
            placeholder={placeholder}
            autoComplete={autoComplete}
            aria-invalid={fieldState.invalid}
            aria-describedby={getFieldDescriptionId(inputId)}
            className={cn(
              FORM_INPUT_CLASS_NAME,
              "h-auto py-2.5",
              TEXTAREA_SIZE_CLASS_NAMES[size],
            )}
          />
        </FormFieldShell>
      )}
    />
  );
}
