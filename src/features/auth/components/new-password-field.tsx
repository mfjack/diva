import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { PasswordField } from "@/components/form/password-field";
import { PASSWORD_MIN_LENGTH } from "../schemas";

type NewPasswordFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
};

export function NewPasswordField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
}: NewPasswordFieldProps<TFieldValues>) {
  return (
    <PasswordField
      control={control}
      name={name}
      label={label}
      autoComplete="new-password"
      description={`Mínimo de ${PASSWORD_MIN_LENGTH} caracteres, com letras e números.`}
    />
  );
}
