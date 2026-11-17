"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { CheckboxField } from "@/components/form/checkbox-field";
import { AuthForm } from "@/features/auth/components/auth-form";
import { useAcceptTermsMutation } from "@/features/auth/hooks/use-accept-terms-mutation";
import { useAuthRedirect } from "@/features/auth/hooks/use-auth-redirect";
import {
  type AcceptTermsInput,
  acceptTermsSchema,
} from "@/features/auth/schemas";
import { ROUTES } from "@/lib/routes";

const LEGAL_LINK_CLASS_NAME = "font-medium text-primary hover:underline";

export function AcceptTermsForm() {
  const redirectAfterAuth = useAuthRedirect();
  const acceptTermsMutation = useAcceptTermsMutation();
  const form = useForm<AcceptTermsInput>({
    resolver: zodResolver(acceptTermsSchema),
    defaultValues: { hasAccepted: false },
  });

  function handleAccepted() {
    redirectAfterAuth(ROUTES.psychologist.home);
  }

  const handleSubmit = form.handleSubmit((values) => {
    acceptTermsMutation.mutate(values, { onSuccess: handleAccepted });
  });

  return (
    <AuthForm
      onSubmit={handleSubmit}
      submitLabel="Continuar"
      isSubmitting={acceptTermsMutation.isPending}
      errorMessage={acceptTermsMutation.error?.message}
    >
      <CheckboxField
        control={form.control}
        name="hasAccepted"
        label={
          <span>
            Li e aceito os{" "}
            <Link
              href={ROUTES.terms}
              target="_blank"
              className={LEGAL_LINK_CLASS_NAME}
            >
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link
              href={ROUTES.privacy}
              target="_blank"
              className={LEGAL_LINK_CLASS_NAME}
            >
              Política de Privacidade
            </Link>
            .
          </span>
        }
      />
    </AuthForm>
  );
}
