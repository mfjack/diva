import { differenceInYears } from "date-fns";
import {
  CalendarClock,
  CircleCheck,
  CircleDollarSign,
  FilePlus2,
  Hourglass,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { WhatsAppLink } from "@/components/whatsapp-link";
import { APPOINTMENT_MODALITY_LABELS } from "@/features/appointments/labels";
import { listPatientAppointments } from "@/features/appointments/queries";
import { listPatientClinicalRecords } from "@/features/clinical-records/queries";
import { PatientStatusBadge } from "@/features/patients/components/patient-status-badge";
import { getPatient } from "@/features/patients/queries";
import { describePaymentTerms } from "@/features/payments/labels";
import { isOverdue, isPaymentDue } from "@/features/payments/overdue";
import { listPatientPayments } from "@/features/payments/queries";
import type { Payment } from "@/features/payments/types";
import { getPracticeSettings } from "@/features/practice-settings/queries";
import { dateKeyToLocalDate, formatDateKey } from "@/lib/dates";
import { formatCurrency, formatShortDate, formatTime } from "@/lib/format";
import { formatCpf } from "@/lib/masks";
import type { Cents } from "@/lib/money";
import { ROUTES } from "@/lib/routes";
import { PatientChargeButton } from "./components/patient-charge-button";
import { PatientDetailsPopover } from "./components/patient-details-popover";
import { PatientRecordsList } from "./components/patient-records-list";
import { PatientSessionsView } from "./components/patient-sessions-view";
import { buildSessionHistory } from "./session-history";

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
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

function getPaidTotalCents(payments: readonly Payment[]): Cents {
  return payments
    .filter(({ status }) => status === "paid")
    .reduce((total, { amountCents }) => total + amountCents, 0) as Cents;
}

export default async function PatientPage({
  params,
}: PageProps<"/dashboard/patients/[patientId]">) {
  const { patientId } = await params;
  const patient = await getPatient(patientId);
  if (!patient) notFound();

  const [appointments, payments, records, settings] = await Promise.all([
    listPatientAppointments(patient.id),
    listPatientPayments(patient.id),
    listPatientClinicalRecords(patient.id),
    getPracticeSettings(),
  ]);
  const duePayments = payments.filter((payment) => isPaymentDue(payment));
  const overduePayments = duePayments.filter((payment) => isOverdue(payment));
  const now = new Date().toISOString();
  const pastAppointments = appointments.filter(
    ({ startsAt }) => startsAt <= now,
  );
  const sessionHistory = buildSessionHistory({
    appointments,
    payments,
    records,
    now,
  });

  return (
    <div className="flex flex-1 flex-col lg:h-svh lg:flex-none lg:overflow-hidden">
      <PageHeader
        title={patient.fullName}
        titleAddon={
          <PatientDetailsPopover>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-sm">Dados</h2>
              <PatientStatusBadge status={patient.status} />
            </div>
            <dl className="flex flex-col gap-3">
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
                  {formatDateKey(patient.birthDate)} (
                  {differenceInYears(
                    new Date(),
                    dateKeyToLocalDate(patient.birthDate),
                  )}{" "}
                  anos)
                </InfoItem>
              )}
              {patient.cpf && (
                <InfoItem label="CPF">{formatCpf(patient.cpf)}</InfoItem>
              )}
              <InfoItem label="Pagamento">
                {describePaymentTerms(patient)}
                {patient.healthInsurance &&
                  ` · Convênio ${patient.healthInsurance}`}
              </InfoItem>
              <InfoItem label="Modalidade">
                {APPOINTMENT_MODALITY_LABELS[patient.preferredModality]}
              </InfoItem>
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
          </PatientDetailsPopover>
        }
        description={`Em acompanhamento desde ${formatDateKey(patient.startedAt)}`}
        actions={
          <>
            {patient.phone && overduePayments.length > 0 && (
              <PatientChargeButton
                patientName={patient.fullName}
                patientPhone={patient.phone}
                items={overduePayments}
                pixKey={settings.pixKey}
              />
            )}
            <Button
              nativeButton={false}
              render={
                <Link
                  href={`${ROUTES.psychologist.records}/new?patientId=${patient.id}`}
                />
              }
            >
              <FilePlus2 aria-hidden />
              Nova anotação
            </Button>
          </>
        }
      />
      <PageContent className="lg:min-h-0 lg:pb-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Próxima sessão"
            value={
              patient.nextAppointmentAt
                ? formatShortDate(patient.nextAppointmentAt)
                : "Sem horário"
            }
            hint={
              patient.nextAppointmentAt
                ? `às ${formatTime(patient.nextAppointmentAt)}`
                : "Nenhuma sessão agendada"
            }
            icon={CalendarClock}
          />
          <StatCard
            label="Sessões realizadas"
            value={String(patient.completedSessionCount)}
            hint={`${pastAppointments.length} no histórico`}
            icon={CircleCheck}
          />
          <StatCard
            label="Total pago"
            value={formatCurrency(getPaidTotalCents(payments))}
            hint={`Sessão a ${formatCurrency(patient.sessionPriceCents)}`}
            icon={CircleDollarSign}
          />
          <StatCard
            label="Em aberto"
            value={formatCurrency(patient.pendingAmountCents)}
            hint={
              overduePayments.length > 0
                ? "Há pagamentos em atraso"
                : "Sessões ainda não pagas"
            }
            icon={Hourglass}
          />
        </div>

        <div className="flex flex-col gap-8 lg:min-h-0 lg:flex-1">
          <Section title="Sessões" className="lg:min-h-0 lg:flex-1">
            <PatientSessionsView
              entries={sessionHistory.entries}
              className="lg:min-h-0 lg:flex-1"
            />
          </Section>
          {sessionHistory.unlinkedRecords.length > 0 && (
            <Section title="Outras anotações">
              <PatientRecordsList records={sessionHistory.unlinkedRecords} />
            </Section>
          )}
        </div>
      </PageContent>
    </div>
  );
}
