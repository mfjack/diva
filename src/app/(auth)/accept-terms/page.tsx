import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthHeader } from "@/features/auth/components/auth-header";
import { requirePsychologist } from "@/features/auth/queries";
import { LEGAL_DOCUMENTS_VERSION } from "@/lib/legal";
import { ROUTES } from "@/lib/routes";
import { AcceptTermsForm } from "./components/accept-terms-form";

export const metadata: Metadata = {
  title: "Termos de uso",
};

export default async function AcceptTermsPage() {
  const psychologist = await requirePsychologist();
  if (psychologist.acceptedTermsVersion === LEGAL_DOCUMENTS_VERSION) {
    redirect(ROUTES.psychologist.home);
  }

  return (
    <>
      <AuthHeader
        title="Antes de começar"
        description="O Divã guarda dados de saúde dos seus pacientes. Leia como cuidamos deles e aceite para continuar."
      />
      <AcceptTermsForm />
    </>
  );
}
