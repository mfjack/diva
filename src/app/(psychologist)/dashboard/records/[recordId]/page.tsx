import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { ClinicalRecordEditor } from "@/features/clinical-records/components/clinical-record-editor";
import { getClinicalRecord } from "@/features/clinical-records/queries";
import { listPatients } from "@/features/patients/queries";
import { formatDate, formatDateTime } from "@/lib/format";

export async function generateMetadata({
  params,
}: PageProps<"/dashboard/records/[recordId]">): Promise<Metadata> {
  const { recordId } = await params;
  const record = await getClinicalRecord(recordId);
  return { title: record?.title ?? "Anotação" };
}

export default async function RecordPage({
  params,
}: PageProps<"/dashboard/records/[recordId]">) {
  const { recordId } = await params;
  const [record, patients] = await Promise.all([
    getClinicalRecord(recordId),
    listPatients(),
  ]);
  if (!record) notFound();

  const details = [
    record.patientName,
    record.sessionStartsAt
      ? `sessão de ${formatDate(record.sessionStartsAt)}`
      : null,
    `atualizado em ${formatDateTime(record.updatedAt)}`,
  ].filter(Boolean);

  return (
    <>
      <PageHeader title={record.title} description={details.join(" · ")} />
      <PageContent>
        <ClinicalRecordEditor
          recordId={record.id}
          defaultValues={{
            patientId: record.patientId,
            appointmentId: record.appointmentId ?? "",
            title: record.title,
            content: record.content,
          }}
          patients={patients}
          attachments={record.attachments}
        />
      </PageContent>
    </>
  );
}
