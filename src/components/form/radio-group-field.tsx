"use client";

import { useId } from "react";
import { Controller, type FieldValues } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormFieldShell, getFieldDescriptionId } from "./form-field-shell";
import type { FormFieldProps } from "./form-field-types";

type RadioOption = {
  value: string;
  label: string;
  description?: string;
};

type RadioGroupFieldProps<TFieldValues extends FieldValues> = Pick<
  FormFieldProps<TFieldValues>,
  "control" | "name" | "label" | "description" | "isLabelHidden"
> & {
  options: readonly RadioOption[];
};

export function RadioGroupField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  isLabelHidden,
  options,
}: RadioGroupFieldProps<TFieldValues>) {
  const groupId = useId();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormFieldShell
          inputId={groupId}
          label={label}
          description={description}
          isLabelHidden={isLabelHidden}
          error={fieldState.error}
        >
          <RadioGroup
            id={groupId}
            ref={field.ref}
            value={field.value ?? null}
            onValueChange={field.onChange}
            aria-describedby={getFieldDescriptionId(groupId)}
            aria-invalid={fieldState.invalid}
          >
            {options.map((option) => (
              <FieldLabel key={option.value}>
                <Field
                  orientation="horizontal"
                  className="rounded-lg border px-4 py-3"
                >
                  <RadioGroupItem value={option.value} />
                  <FieldContent>
                    <FieldTitle>{option.label}</FieldTitle>
                    {option.description && (
                      <FieldDescription>{option.description}</FieldDescription>
                    )}
                  </FieldContent>
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
        </FormFieldShell>
      )}
    />
  );
}
