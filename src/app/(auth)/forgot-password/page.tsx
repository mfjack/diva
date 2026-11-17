import type { Metadata } from "next";
import { AuthFooterLink } from "@/features/auth/components/auth-footer-link";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { ROUTES } from "@/lib/routes";
import { ForgotPasswordForm } from "./components/forgot-password-form";

export const metadata: Metadata = {
  title: "Esqueci a senha",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeader
        title="Esqueceu a senha?"
        description="Informe seu email e enviaremos um link para criar uma nova."
      />
      <ForgotPasswordForm />
      <AuthFooterLink
        question="Lembrou a senha?"
        href={ROUTES.login}
        linkLabel="Voltar para o login"
      />
    </>
  );
}
