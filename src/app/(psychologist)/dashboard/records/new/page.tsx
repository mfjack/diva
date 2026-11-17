import type { Metadata } from "next";
import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { ClinicalRecordEditor } from "@/features/clinical-records/components/clinical-record-editor";
import { listDocumentTemplates } from "@/features/clinical-records/queries";
import { clinicalRecordSchema } from "@/features/clinical-records/schemas";
import { listPatients } from "@/features/patients/queries";
import { getSingleSearchParam } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Novo documento",
};

export default async function NewRecordPage({
  searchParams,
}: PageProps<"/dashboard/records/new">) {
  const { patientId, kind } = await searchParams;
  const [patients, templates] = await Promise.all([
    listPatients(),
    listDocumentTemplates(),
  ]);
  const initialPatientId = patients.find(({ id }) => id === patientId)?.id;
  const parsedKind = clinicalRecordSchema.shape.kind.safeParse(
    getSingleSearchParam(kind),
  );
  const initialKind = parsedKind.success ? parsedKind.data : undefined;

  return (
    <>
      <PageHeader
        title="Novo documento"
        description="Escolha um modelo ou escreva do zero."
      />
      <PageContent>
        <ClinicalRecordEditor
          recordId={null}
          defaultValues={{ patientId: initialPatientId, kind: initialKind }}
          patients={patients}
          templates={templates}
        />
      </PageContent>
    </>
  );
}
