"use client";

import type { FieldValues } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ControlledFormField } from "./controlled-form-field";
import { FORM_INPUT_CLASS_NAME } from "./form-field-styles";
import type { FormFieldProps } from "./form-field-types";

const TEXTAREA_SIZE_CLASS_NAMES = {
  default: "min-h-20",
  medium: "min-h-60 leading-relaxed",
  large: "min-h-96 leading-relaxed",
} as const;

type TextareaFieldProps<TFieldValues extends FieldValues> =
  FormFieldProps<TFieldValues> & {
    size?: keyof typeof TEXTAREA_SIZE_CLASS_NAMES;
  };

export function TextareaField<TFieldValues extends FieldValues>({
  placeholder,
  autoComplete,
  size = "default",
  ...fieldProps
}: TextareaFieldProps<TFieldValues>) {
  return (
    <ControlledFormField {...fieldProps}>
      {({ field, controlProps }) => (
        <Textarea
          {...field}
          value={field.value ?? ""}
          {...controlProps}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cn(
            FORM_INPUT_CLASS_NAME,
            "h-auto py-2.5",
            TEXTAREA_SIZE_CLASS_NAMES[size],
          )}
        />
      )}
    </ControlledFormField>
  );
}
