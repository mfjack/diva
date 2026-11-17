"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { PasswordField } from "@/components/form/password-field";
import { AuthFooterLink } from "@/features/auth/components/auth-footer-link";
import { AuthForm } from "@/features/auth/components/auth-form";
import { EmailField } from "@/features/auth/components/email-field";
import { GoogleSignIn } from "@/features/auth/components/google-sign-in";
import { useAuthRedirect } from "@/features/auth/hooks/use-auth-redirect";
import { useSignInMutation } from "@/features/auth/hooks/use-sign-in-mutation";
import { type SignInInput, signInSchema } from "@/features/auth/schemas";
import { buildAuthRoute, ROUTES } from "@/lib/routes";
import { getSafeRedirectPath } from "@/lib/safe-redirect";

type SignInFormProps = {
  nextPath?: string;
  initialErrorMessage?: string;
};

export function SignInForm({ nextPath, initialErrorMessage }: SignInFormProps) {
  const redirectAfterAuth = useAuthRedirect();
  const signInMutation = useSignInMutation();
  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  function handleSignedIn() {
    redirectAfterAuth(getSafeRedirectPath(nextPath));
  }

  const handleSubmit = form.handleSubmit((values) => {
    signInMutation.mutate(values, { onSuccess: handleSignedIn });
  });

  return (
    <>
      <AuthForm
        onSubmit={handleSubmit}
        submitLabel="Entrar"
        isSubmitting={signInMutation.isPending}
        errorMessage={signInMutation.error?.message ?? initialErrorMessage}
        alternativeAction={
          <GoogleSignIn label="Entrar com Google" nextPath={nextPath} />
        }
      >
        <EmailField control={form.control} name="email" />
        <PasswordField
          control={form.control}
          name="password"
          label="Senha"
          autoComplete="current-password"
          labelAction={
            <Link
              href={ROUTES.forgotPassword}
              className="font-medium text-primary text-sm hover:underline"
            >
              Esqueci a senha
            </Link>
          }
        />
      </AuthForm>

      <AuthFooterLink
        question="Ainda não tem conta?"
        href={buildAuthRoute(ROUTES.signUp, nextPath)}
        linkLabel="Criar conta"
      />
    </>
  );
}
