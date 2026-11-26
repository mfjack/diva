"use client";

import type { FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { ControlledFormField } from "./controlled-form-field";
import { FORM_INPUT_CLASS_NAME } from "./form-field-styles";
import type { FormFieldProps } from "./form-field-types";

type TextFieldProps<TFieldValues extends FieldValues> =
  FormFieldProps<TFieldValues> & {
    type?: "text" | "email" | "tel" | "url";
  };

export function TextField<TFieldValues extends FieldValues>({
  type = "text",
  placeholder,
  autoComplete,
  ...fieldProps
}: TextFieldProps<TFieldValues>) {
  return (
    <ControlledFormField {...fieldProps}>
      {({ field, controlProps }) => (
        <Input
          {...field}
          value={field.value ?? ""}
          {...controlProps}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={FORM_INPUT_CLASS_NAME}
        />
      )}
    </ControlledFormField>
  );
}
