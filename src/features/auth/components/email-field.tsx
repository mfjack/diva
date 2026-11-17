import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { TextField } from "@/components/form/text-field";

type EmailFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
};

export function EmailField<TFieldValues extends FieldValues>({
  control,
  name,
}: EmailFieldProps<TFieldValues>) {
  return (
    <TextField
      control={control}
      name={name}
      label="Email"
      type="email"
      autoComplete="email"
      placeholder="voce@exemplo.com"
    />
  );
}
