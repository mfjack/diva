import type { Metadata } from "next";
import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { listBusyPeriods } from "@/features/appointments/queries";
import { getCurrentPatient } from "@/features/patients/queries";
import {
  getPracticeSettings,
  listAvailabilityBlocks,
  listAvailabilityRules,
} from "@/features/practice-settings/queries";
import { BookingView } from "./components/booking-view";

export const metadata: Metadata = {
  title: "Agendar sessão",
};

export default async function BookPage() {
  const [patient, settings, rules, blocks, busyPeriods] = await Promise.all([
    getCurrentPatient(),
    getPracticeSettings(),
    listAvailabilityRules(),
    listAvailabilityBlocks(),
    listBusyPeriods(),
  ]);

  return (
    <>
      <PageHeader
        title="Agendar sessão"
        description={`Sessões de ${settings.sessionDurationMinutes} minutos com ${settings.psychologistName}.`}
      />
      <PageContent>
        <BookingView
          rules={rules}
          blocks={blocks}
          busyPeriods={busyPeriods}
          sessionDurationMinutes={settings.sessionDurationMinutes}
          minimumBookingNoticeHours={settings.minimumBookingNoticeHours}
          bookingWindowDays={settings.bookingWindowDays}
          cancellationNoticeHours={settings.cancellationNoticeHours}
          priceCents={patient.sessionPriceCents}
          officeAddress={settings.officeAddress}
        />
      </PageContent>
    </>
  );
}
