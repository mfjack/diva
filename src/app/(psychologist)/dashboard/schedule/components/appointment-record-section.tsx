import { NotebookPen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/features/appointments/types";
import type { SessionNoteSummary } from "@/features/clinical-records/types";
import { formatShortDate } from "@/lib/format";
import { buildNewSessionNoteRoute, ROUTES } from "@/lib/routes";
import { DetailItem, DetailsSection } from "./details-section";

type AppointmentRecordSectionProps = {
  appointment: Appointment;
  latestSessionNote: SessionNoteSummary | null;
};

export function AppointmentRecordSection({
  appointment,
  latestSessionNote,
}: AppointmentRecordSectionProps) {
  const isCompleted = appointment.status === "completed";

  return (
    <DetailsSection title="Prontuário">
      <DetailItem label="Última evolução">
        {latestSessionNote ? (
          <Link
            href={`${ROUTES.psychologist.records}/${latestSessionNote.id}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {formatShortDate(latestSessionNote.createdAt)}
          </Link>
        ) : (
          <span className="text-muted-foreground">Nenhuma ainda</span>
        )}
      </DetailItem>
      {isCompleted && (
        <div className="pt-3">
          <Button
            size="lg"
            className="w-full"
            nativeButton={false}
            render={
              <Link href={buildNewSessionNoteRoute(appointment.patientId)} />
            }
          >
            <NotebookPen aria-hidden />
            Registrar evolução
          </Button>
        </div>
      )}
    </DetailsSection>
  );
}
