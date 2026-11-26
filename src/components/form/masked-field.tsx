"use client";

import type { FieldValues } from "react-hook-form";
import { NumberFormatBase } from "react-number-format";
import { Input } from "@/components/ui/input";
import {
  applyDigitPattern,
  CPF_PATTERN,
  getPhonePattern,
  onlyDigits,
} from "@/lib/masks";
import { ControlledFormField } from "./controlled-form-field";
import { FORM_INPUT_CLASS_NAME } from "./form-field-styles";
import type { FormFieldProps } from "./form-field-types";

const MASK_PRESETS = {
  cpf: { getPattern: () => CPF_PATTERN, maxDigits: 11, inputMode: "numeric" },
  phone: { getPattern: getPhonePattern, maxDigits: 11, inputMode: "tel" },
} as const;

type MaskedFieldProps<TFieldValues extends FieldValues> =
  FormFieldProps<TFieldValues> & {
    mask: keyof typeof MASK_PRESETS;
  };

export function MaskedField<TFieldValues extends FieldValues>({
  placeholder,
  autoComplete,
  mask,
  ...fieldProps
}: MaskedFieldProps<TFieldValues>) {
  const preset = MASK_PRESETS[mask];

  function formatDigits(value: string) {
    const digits = onlyDigits(value).slice(0, preset.maxDigits);
    return applyDigitPattern(digits, preset.getPattern(digits));
  }
  return (
    <ControlledFormField {...fieldProps}>
      {({ field, controlProps }) => (
        <NumberFormatBase
          customInput={Input}
          getInputRef={field.ref}
          {...controlProps}
          name={field.name}
          value={field.value ?? ""}
          valueIsNumericString
          format={formatDigits}
          removeFormatting={(value) =>
            onlyDigits(value).slice(0, preset.maxDigits)
          }
          getCaretBoundary={(formattedValue) =>
            Array.from({ length: formattedValue.length + 1 }, () => true)
          }
          onValueChange={({ value }) => field.onChange(value)}
          onBlur={field.onBlur}
          inputMode={preset.inputMode}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={FORM_INPUT_CLASS_NAME}
        />
      )}
    </ControlledFormField>
  );
}
