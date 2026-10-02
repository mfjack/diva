import { differenceInYears } from "date-fns";
import { FilePlus2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { UrlTabs } from "@/components/url-tabs";
import { WhatsAppLink } from "@/components/whatsapp-link";
import { listPatientAppointments } from "@/features/appointments/queries";
import { listPatientClinicalRecords } from "@/features/clinical-records/queries";
import { PatientStatusBadge } from "@/features/patients/components/patient-status-badge";
import { getPatient } from "@/features/patients/queries";
import { listPatientPayments } from "@/features/payments/queries";
import { formatCurrency, formatDate } from "@/lib/format";
import { formatCpf } from "@/lib/masks";
import { ROUTES } from "@/lib/routes";
import { EditPatientButton } from "./components/edit-patient-button";
import { PatientAppointmentsList } from "./components/patient-appointments-list";
import { PatientPaymentsList } from "./components/patient-payments-list";
import { PatientRecordsList } from "./components/patient-records-list";

export async function generateMetadata({
  params,
}: PageProps<"/dashboard/patients/[patientId]">): Promise<Metadata> {
  const { patientId } = await params;
  const patient = await getPatient(patientId);
  return { title: patient?.fullName ?? "Paciente" };
}

type InfoItemProps = {
  label: string;
  children: ReactNode;
};

function InfoItem({ label, children }: InfoItemProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export default async function PatientPage({
  params,
}: PageProps<"/dashboard/patients/[patientId]">) {
  const { patientId } = await params;
  const patient = await getPatient(patientId);
  if (!patient) notFound();

  const [appointments, payments, records] = await Promise.all([
    listPatientAppointments(patient.id),
    listPatientPayments(patient.id),
    listPatientClinicalRecords(patient.id),
  ]);

  return (
    <>
      <PageHeader
        title={patient.fullName}
        description={`Em acompanhamento desde ${formatDate(patient.startedAt)} · ${patient.completedSessionCount} sessões realizadas`}
        actions={
          <>
            <EditPatientButton patient={patient} />
            <Button
              nativeButton={false}
              render={
                <Link
                  href={`${ROUTES.psychologist.records}/new?patientId=${patient.id}`}
                />
              }
            >
              <FilePlus2 aria-hidden />
              Novo documento
            </Button>
          </>
        }
      />
      <PageContent>
        <div className="grid gap-8 lg:grid-cols-3">
          <aside className="flex flex-col gap-5 rounded-xl border p-5 lg:self-start">
            <PatientStatusBadge status={patient.status} />
            <dl className="grid grid-cols-2 gap-4 lg:grid-cols-1">
              {patient.phone && (
                <InfoItem label="WhatsApp">
                  <WhatsAppLink phone={patient.phone} />
                </InfoItem>
              )}
              {patient.email && (
                <InfoItem label="E-mail">
                  <a
                    href={`mailto:${patient.email}`}
                    className="break-all underline-offset-4 hover:underline"
                  >
                    {patient.email}
                  </a>
                </InfoItem>
              )}
              {patient.birthDate && (
                <InfoItem label="Nascimento">
                  {formatDate(`${patient.birthDate}T12:00:00Z`)} (
                  {differenceInYears(new Date(), new Date(patient.birthDate))}{" "}
                  anos)
                </InfoItem>
              )}
              {patient.cpf && (
                <InfoItem label="CPF">{formatCpf(patient.cpf)}</InfoItem>
              )}
              <InfoItem label="Valor da sessão">
                {formatCurrency(patient.sessionPriceCents)}
              </InfoItem>
              {patient.healthInsurance && (
                <InfoItem label="Plano de saúde">
                  {patient.healthInsurance}
                </InfoItem>
              )}
              {patient.emergencyContactName && (
                <InfoItem label="Contato de emergência">
                  <span className="flex flex-col gap-0.5">
                    {patient.emergencyContactName}
                    {patient.emergencyContactPhone && (
                      <WhatsAppLink
                        phone={patient.emergencyContactPhone}
                        className="text-muted-foreground"
                      />
                    )}
                  </span>
                </InfoItem>
              )}
            </dl>
            {patient.notes && (
              <p className="rounded-lg bg-muted p-3 text-sm">{patient.notes}</p>
            )}
          </aside>

          <div className="lg:col-span-2">
            <UrlTabs
              tabs={[
                {
                  value: "sessions",
                  label: `Sessões (${appointments.length})`,
                  content: (
                    <PatientAppointmentsList appointments={appointments} />
                  ),
                },
                {
                  value: "payments",
                  label: "Financeiro",
                  content: <PatientPaymentsList payments={payments} />,
                },
                {
                  value: "records",
                  label: `Prontuário (${records.length})`,
                  content: <PatientRecordsList records={records} />,
                },
              ]}
            />
          </div>
        </div>
      </PageContent>
    </>
  );
}
