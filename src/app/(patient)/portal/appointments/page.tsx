import type { Metadata } from "next";
import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { listPatientAppointments } from "@/features/appointments/queries";
import { getCurrentPatient } from "@/features/patients/queries";
import { getPracticeSettings } from "@/features/practice-settings/queries";
import { PatientAppointmentsView } from "./components/patient-appointments-view";

export const metadata: Metadata = {
  title: "Minhas consultas",
};

export default async function PatientAppointmentsPage() {
  const patient = await getCurrentPatient();
  const [appointments, settings] = await Promise.all([
    listPatientAppointments(patient.id),
    getPracticeSettings(),
  ]);

  return (
    <>
      <PageHeader
        title="Minhas consultas"
        description={`Cancelamento sem custo até ${settings.cancellationNoticeHours}h antes da sessão.`}
      />
      <PageContent>
        <PatientAppointmentsView
          initialAppointments={appointments}
          cancellationNoticeHours={settings.cancellationNoticeHours}
        />
      </PageContent>
    </>
  );
}
