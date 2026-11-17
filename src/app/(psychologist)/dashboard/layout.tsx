import { Logo } from "@/components/brand/logo";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { requirePsychologist } from "@/features/auth/queries";
import { getPracticeSettings } from "@/features/practice-settings/queries";
import { ROUTES } from "@/lib/routes";
import { PsychologistSidebar } from "./components/psychologist-sidebar";

export default async function PsychologistLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const [settings, psychologist] = await Promise.all([
    getPracticeSettings(),
    requirePsychologist(),
  ]);

  return (
    <SidebarProvider>
      <PsychologistSidebar
        psychologistName={settings.psychologistName}
        professionalRegistration={settings.professionalRegistration}
        avatarUrl={psychologist.avatarUrl}
      />
      <SidebarInset>
        <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur md:hidden">
          <SidebarTrigger aria-label="Abrir menu" />
          <Logo href={ROUTES.psychologist.home} className="text-xl" />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
