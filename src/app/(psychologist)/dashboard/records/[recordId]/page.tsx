import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { ClinicalRecordEditor } from "@/features/clinical-records/components/clinical-record-editor";
import { CLINICAL_RECORD_KIND_LABELS } from "@/features/clinical-records/labels";
import {
  getClinicalRecord,
  listDocumentTemplates,
} from "@/features/clinical-records/queries";
import { listPatients } from "@/features/patients/queries";
import { formatDateTime } from "@/lib/format";

export async function generateMetadata({
  params,
}: PageProps<"/dashboard/records/[recordId]">): Promise<Metadata> {
  const { recordId } = await params;
  const record = await getClinicalRecord(recordId);
  return { title: record?.title ?? "Documento" };
}

export default async function RecordPage({
  params,
}: PageProps<"/dashboard/records/[recordId]">) {
  const { recordId } = await params;
  const [record, patients, templates] = await Promise.all([
    getClinicalRecord(recordId),
    listPatients(),
    listDocumentTemplates(),
  ]);
  if (!record) notFound();

  return (
    <>
      <PageHeader
        title={record.title}
        description={`${CLINICAL_RECORD_KIND_LABELS[record.kind]} · ${record.patientName} · atualizado em ${formatDateTime(record.updatedAt)}`}
      />
      <PageContent>
        <ClinicalRecordEditor
          recordId={record.id}
          defaultValues={{
            patientId: record.patientId,
            kind: record.kind,
            title: record.title,
            content: record.content,
          }}
          patients={patients}
          templates={templates}
        />
      </PageContent>
    </>
  );
}
