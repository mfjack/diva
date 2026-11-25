import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SIDEBAR_COOKIE_NAME,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { requirePsychologist } from "@/features/auth/queries";
import { getPracticeSettings } from "@/features/practice-settings/queries";
import { LEGAL_DOCUMENTS_VERSION } from "@/lib/legal";
import { ROUTES } from "@/lib/routes";
import { PsychologistSidebar } from "./components/psychologist-sidebar";

export default async function PsychologistLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const [settings, psychologist, cookieStore] = await Promise.all([
    getPracticeSettings(),
    requirePsychologist(),
    cookies(),
  ]);
  const isSidebarOpen = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== "false";
  if (psychologist.acceptedTermsVersion !== LEGAL_DOCUMENTS_VERSION) {
    redirect(ROUTES.acceptTerms);
  }

  return (
    <SidebarProvider defaultOpen={isSidebarOpen}>
      <PsychologistSidebar
        psychologistName={settings.psychologistName}
        professionalRegistration={settings.professionalRegistration}
        avatarUrl={psychologist.avatarUrl}
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
