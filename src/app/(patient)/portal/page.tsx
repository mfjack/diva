import { CalendarPlus, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { listPatientAppointments } from "@/features/appointments/queries";
import { splitAppointmentsByTime } from "@/features/appointments/upcoming";
import { getCurrentPatient } from "@/features/patients/queries";
import { listPatientPayments } from "@/features/payments/queries";
import { getPracticeSettings } from "@/features/practice-settings/queries";
import { formatCurrency } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import { NextAppointmentCard } from "./components/next-appointment-card";
import { PendingPaymentsNotice } from "./components/pending-payments-notice";

export const metadata: Metadata = {
  title: "Minha área",
};

export default async function PortalPage() {
  const patient = await getCurrentPatient();
  const [appointments, payments, settings] = await Promise.all([
    listPatientAppointments(patient.id),
    listPatientPayments(patient.id),
    getPracticeSettings(),
  ]);
  const { upcoming } = splitAppointmentsByTime(appointments);
  const [nextAppointment] = upcoming;
  const pendingPayments = payments.filter(({ status }) => status === "pending");
  const firstName = patient.fullName.split(" ")[0] ?? "";

  return (
    <>
      <PageHeader
        title={`Olá, ${firstName}`}
        description="Que bom ter você por aqui."
      />
      <PageContent>
        {pendingPayments.length > 0 && (
          <PendingPaymentsNotice payments={pendingPayments} />
        )}

        <Section title="Sua próxima sessão">
          {nextAppointment ? (
            <NextAppointmentCard appointment={nextAppointment} />
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed p-6">
              <p className="text-muted-foreground">
                Você não tem sessões marcadas.
              </p>
              <Button
                nativeButton={false}
                render={<Link href={ROUTES.patient.book} />}
              >
                <CalendarPlus aria-hidden />
                Agendar sessão
              </Button>
            </div>
          )}
        </Section>

        {upcoming.length > 1 && (
          <p className="text-muted-foreground text-sm">
            Você tem mais {upcoming.length - 1} sessões marcadas.{" "}
            <Link
              href={ROUTES.patient.appointments}
              className="font-medium text-foreground underline underline-offset-4"
            >
              Ver todas
            </Link>
          </p>
        )}

        <Section title="Sua psicóloga">
          <article className="flex flex-col gap-4 rounded-xl border p-6">
            <div className="flex flex-col gap-0.5">
              <h3 className="font-heading text-3xl">
                {settings.psychologistName}
              </h3>
              <span className="text-muted-foreground text-sm">
                {settings.professionalRegistration}
              </span>
            </div>
            {settings.bio && <p className="max-w-2xl">{settings.bio}</p>}
            <dl className="grid gap-4 text-sm sm:grid-cols-3">
              <div className="flex flex-col gap-0.5">
                <dt className="text-muted-foreground">Sessão</dt>
                <dd>
                  {settings.sessionDurationMinutes} minutos ·{" "}
                  {formatCurrency(patient.sessionPriceCents)}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-muted-foreground">Cancelamento</dt>
                <dd>Sem custo até {settings.cancellationNoticeHours}h antes</dd>
              </div>
              {settings.officeAddress && (
                <div className="flex flex-col gap-0.5">
                  <dt className="text-muted-foreground">Consultório</dt>
                  <dd className="flex items-start gap-1.5">
                    <MapPin aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                    {settings.officeAddress}
                  </dd>
                </div>
              )}
            </dl>
          </article>
        </Section>
      </PageContent>
    </>
  );
}
