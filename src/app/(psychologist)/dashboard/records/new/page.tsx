import type { Metadata } from "next";
import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { getAppointment } from "@/features/appointments/queries";
import { ClinicalRecordEditor } from "@/features/clinical-records/components/clinical-record-editor";
import { listPatients } from "@/features/patients/queries";
import { getSingleSearchParam } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Nova anotação",
};

export default async function NewRecordPage({
  searchParams,
}: PageProps<"/dashboard/records/new">) {
  const params = await searchParams;
  const appointmentIdParam = getSingleSearchParam(params.appointmentId);
  const [patients, appointment] = await Promise.all([
    listPatients(),
    appointmentIdParam ? getAppointment(appointmentIdParam) : null,
  ]);
  const patientIdParam =
    appointment?.patientId ?? getSingleSearchParam(params.patientId);
  const initialPatientId = patients.find(({ id }) => id === patientIdParam)?.id;

  return (
    <>
      <PageHeader
        title="Nova anotação"
        description="Registre a sessão e, depois de salvar, anexe documentos."
      />
      <PageContent>
        <ClinicalRecordEditor
          recordId={null}
          defaultValues={{
            patientId: initialPatientId,
            appointmentId: appointment?.id ?? "",
          }}
          patients={patients}
          attachments={[]}
        />
      </PageContent>
    </>
  );
}
