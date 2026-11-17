import type { FormEventHandler, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { AuthAlert } from "./auth-alert";
import { AUTH_BUTTON_CLASS_NAME } from "./auth-styles";

type AuthFormProps = {
  onSubmit: FormEventHandler<HTMLFormElement>;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage?: string;
  children: ReactNode;
};

export function AuthForm({
  onSubmit,
  submitLabel,
  isSubmitting,
  errorMessage,
  children,
}: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        {children}

        {errorMessage && <AuthAlert>{errorMessage}</AuthAlert>}

        <div className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className={AUTH_BUTTON_CLASS_NAME}
          >
            {isSubmitting && <Spinner aria-hidden />}
            {submitLabel}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
