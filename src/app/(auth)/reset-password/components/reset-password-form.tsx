"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PasswordField } from "@/components/form/password-field";
import { AuthForm } from "@/features/auth/components/auth-form";
import { NewPasswordField } from "@/features/auth/components/new-password-field";
import { useAuthRedirect } from "@/features/auth/hooks/use-auth-redirect";
import { useResetPasswordMutation } from "@/features/auth/hooks/use-reset-password-mutation";
import {
  type ResetPasswordInput,
  resetPasswordSchema,
} from "@/features/auth/schemas";
import { ROUTES } from "@/lib/routes";

export function ResetPasswordForm() {
  const redirectAfterAuth = useAuthRedirect();
  const resetPasswordMutation = useResetPasswordMutation();
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  function handlePasswordReset() {
    toast.success("Senha atualizada.");
    redirectAfterAuth(ROUTES.psychologist.home);
  }

  const handleSubmit = form.handleSubmit((values) => {
    resetPasswordMutation.mutate(values, { onSuccess: handlePasswordReset });
  });

  return (
    <AuthForm
      onSubmit={handleSubmit}
      submitLabel="Salvar nova senha"
      isSubmitting={resetPasswordMutation.isPending}
      errorMessage={resetPasswordMutation.error?.message}
    >
      <NewPasswordField
        control={form.control}
        name="password"
        label="Nova senha"
      />
      <PasswordField
        control={form.control}
        name="confirmPassword"
        label="Confirme a nova senha"
        autoComplete="new-password"
      />
    </AuthForm>
  );
}
