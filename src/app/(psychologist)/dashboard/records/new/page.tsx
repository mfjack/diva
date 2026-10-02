import type { Metadata } from "next";
import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { ClinicalRecordEditor } from "@/features/clinical-records/components/clinical-record-editor";
import { listDocumentTemplates } from "@/features/clinical-records/queries";
import { listPatients } from "@/features/patients/queries";

export const metadata: Metadata = {
  title: "Novo documento",
};

export default async function NewRecordPage({
  searchParams,
}: PageProps<"/dashboard/records/new">) {
  const { patientId } = await searchParams;
  const [patients, templates] = await Promise.all([
    listPatients(),
    listDocumentTemplates(),
  ]);
  const initialPatientId = patients.find(({ id }) => id === patientId)?.id;

  return (
    <>
      <PageHeader
        title="Novo documento"
        description="Escolha um modelo ou escreva do zero."
      />
      <PageContent>
        <ClinicalRecordEditor
          recordId={null}
          defaultValues={{ patientId: initialPatientId }}
          patients={patients}
          templates={templates}
        />
      </PageContent>
    </>
  );
}
