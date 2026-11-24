import { redirect } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requirePsychologist } from "@/features/auth/queries";
import { getPracticeSettings } from "@/features/practice-settings/queries";
import { LEGAL_DOCUMENTS_VERSION } from "@/lib/legal";
import { ROUTES } from "@/lib/routes";
import { PsychologistSidebar } from "./components/psychologist-sidebar";

export default async function PsychologistLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const [settings, psychologist] = await Promise.all([
    getPracticeSettings(),
    requirePsychologist(),
  ]);
  if (psychologist.acceptedTermsVersion !== LEGAL_DOCUMENTS_VERSION) {
    redirect(ROUTES.acceptTerms);
  }

  return (
    <SidebarProvider>
      <PsychologistSidebar
        psychologistName={settings.psychologistName}
        professionalRegistration={settings.professionalRegistration}
        avatarUrl={psychologist.avatarUrl}
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
