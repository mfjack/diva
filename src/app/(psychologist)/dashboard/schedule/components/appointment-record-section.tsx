import { NotebookPen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/features/appointments/types";
import type { SessionNoteSummary } from "@/features/clinical-records/types";
import { buildNewSessionNoteRoute, ROUTES } from "@/lib/routes";
import { DetailItem, DetailsSection } from "./details-section";

type AppointmentRecordSectionProps = {
  appointment: Appointment;
  sessionNote: SessionNoteSummary | null;
};

export function AppointmentRecordSection({
  appointment,
  sessionNote,
}: AppointmentRecordSectionProps) {
  const canAddNote = !sessionNote && appointment.status !== "cancelled";

  return (
    <DetailsSection title="Prontuário">
      <DetailItem label="Anotações da sessão">
        {sessionNote ? (
          <Link
            href={`${ROUTES.psychologist.records}/${sessionNote.id}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            Abrir
          </Link>
        ) : (
          <span className="text-muted-foreground">Nenhuma ainda</span>
        )}
      </DetailItem>
      {canAddNote && (
        <div className="pt-3">
          <Button
            size="lg"
            className="w-full"
            nativeButton={false}
            render={<Link href={buildNewSessionNoteRoute(appointment.id)} />}
          >
            <NotebookPen aria-hidden />
            Registrar anotações
          </Button>
        </div>
      )}
    </DetailsSection>
  );
}
