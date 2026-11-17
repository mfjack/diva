"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AuthForm } from "@/features/auth/components/auth-form";
import { EmailField } from "@/features/auth/components/email-field";
import { useRequestPasswordResetMutation } from "@/features/auth/hooks/use-request-password-reset-mutation";
import {
  type ForgotPasswordInput,
  forgotPasswordSchema,
} from "@/features/auth/schemas";

const RESET_LINK_SENT_MESSAGE =
  "Se houver uma conta com esse email, o link chega em instantes. Confira também a caixa de spam.";

export function ForgotPasswordForm() {
  const requestPasswordResetMutation = useRequestPasswordResetMutation();
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const hasSentResetLink = requestPasswordResetMutation.isSuccess;

  const handleSubmit = form.handleSubmit((values) => {
    requestPasswordResetMutation.mutate(values);
  });

  return (
    <AuthForm
      onSubmit={handleSubmit}
      submitLabel={hasSentResetLink ? "Reenviar link" : "Enviar link"}
      isSubmitting={requestPasswordResetMutation.isPending}
      errorMessage={requestPasswordResetMutation.error?.message}
      successMessage={hasSentResetLink ? RESET_LINK_SENT_MESSAGE : undefined}
    >
      <EmailField control={form.control} name="email" />
    </AuthForm>
  );
}
