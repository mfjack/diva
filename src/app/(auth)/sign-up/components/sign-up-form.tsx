"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { TextField } from "@/components/form/text-field";
import type { SignUpResult } from "@/features/auth/actions";
import { AuthFooterLink } from "@/features/auth/components/auth-footer-link";
import { AuthForm } from "@/features/auth/components/auth-form";
import { EmailField } from "@/features/auth/components/email-field";
import { GoogleSignIn } from "@/features/auth/components/google-sign-in";
import { NewPasswordField } from "@/features/auth/components/new-password-field";
import { useAuthRedirect } from "@/features/auth/hooks/use-auth-redirect";
import { useSignUpMutation } from "@/features/auth/hooks/use-sign-up-mutation";
import { type SignUpInput, signUpSchema } from "@/features/auth/schemas";
import { buildAuthRoute, ROUTES } from "@/lib/routes";
import { getSafeRedirectPath } from "@/lib/safe-redirect";
import { EmailConfirmationNotice } from "./email-confirmation-notice";

type SignUpFormProps = {
  nextPath?: string;
};

export function SignUpForm({ nextPath }: SignUpFormProps) {
  const redirectAfterAuth = useAuthRedirect();
  const signUpMutation = useSignUpMutation();
  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  function handleSignedUp({ requiresEmailConfirmation }: SignUpResult) {
    if (requiresEmailConfirmation) return;
    redirectAfterAuth(getSafeRedirectPath(nextPath));
  }

  const handleSubmit = form.handleSubmit((values) => {
    signUpMutation.mutate(
      { ...values, nextPath },
      { onSuccess: handleSignedUp },
    );
  });

  if (
    signUpMutation.data?.requiresEmailConfirmation &&
    signUpMutation.variables
  ) {
    return <EmailConfirmationNotice email={signUpMutation.variables.email} />;
  }

  return (
    <>
      <AuthForm
        onSubmit={handleSubmit}
        submitLabel="Criar conta"
        isSubmitting={signUpMutation.isPending}
        errorMessage={signUpMutation.error?.message}
        alternativeAction={
          <GoogleSignIn label="Cadastrar com Google" nextPath={nextPath} />
        }
      >
        <TextField
          control={form.control}
          name="fullName"
          label="Nome completo"
          autoComplete="name"
          placeholder="Seu nome"
        />
        <EmailField control={form.control} name="email" />
        <NewPasswordField
          control={form.control}
          name="password"
          label="Senha"
        />
      </AuthForm>

      <AuthFooterLink
        question="Já tem conta?"
        href={buildAuthRoute(ROUTES.login, nextPath)}
        linkLabel="Entrar"
      />
    </>
  );
}
