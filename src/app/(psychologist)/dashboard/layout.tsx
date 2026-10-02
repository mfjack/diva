import { Logo } from "@/components/brand/logo";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/lib/routes";
import { mockPracticeSettings } from "@/mocks/practice";
import { PsychologistSidebar } from "./components/psychologist-sidebar";

export default function PsychologistLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return (
    <SidebarProvider>
      <PsychologistSidebar
        psychologistName={mockPracticeSettings.psychologistName}
        professionalRegistration={mockPracticeSettings.professionalRegistration}
      />
      <SidebarInset>
        <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur md:hidden">
          <SidebarTrigger aria-label="Abrir menu" />
          <Logo href={ROUTES.psychologist.dashboard} className="text-xl" />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
