"use client";

import { type ReactNode, useId } from "react";
import {
  Controller,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { FormFieldShell, getFieldDescriptionId } from "./form-field-shell";
import type { FormFieldProps } from "./form-field-types";

type FormControlProps = {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby": string;
};

type ControlledFormFieldRenderProps<TFieldValues extends FieldValues> = {
  field: ControllerRenderProps<TFieldValues, FieldPath<TFieldValues>>;
  fieldState: ControllerFieldState;
  controlProps: FormControlProps;
};

type ControlledFormFieldProps<TFieldValues extends FieldValues> = Pick<
  FormFieldProps<TFieldValues>,
  "control" | "name" | "label" | "description" | "labelAction" | "isLabelHidden"
> & {
  children: (
    renderProps: ControlledFormFieldRenderProps<TFieldValues>,
  ) => ReactNode;
};

export function ControlledFormField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  labelAction,
  isLabelHidden,
  children,
}: ControlledFormFieldProps<TFieldValues>) {
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
          {children({
            field,
            fieldState,
            controlProps: {
              id: inputId,
              "aria-invalid": fieldState.invalid,
              "aria-describedby": getFieldDescriptionId(inputId),
            },
          })}
        </FormFieldShell>
      )}
    />
  );
}
