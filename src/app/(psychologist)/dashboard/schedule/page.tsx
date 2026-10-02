import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Metadata } from "next";
import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { listAppointmentsBetween } from "@/features/appointments/queries";
import { listPatients } from "@/features/patients/queries";
import { getPracticeSettings } from "@/features/practice-settings/queries";
import { zonedDateTime } from "@/lib/dates";
import { getWeekDateKeys, parseWeekOffset } from "@/lib/week";
import { ScheduleView } from "./components/schedule-view";
import { WeekNavigator } from "./components/week-navigator";

export const metadata: Metadata = {
  title: "Agenda",
};

function formatWeekRange(firstDateKey: string, lastDateKey: string): string {
  const firstDay = zonedDateTime(firstDateKey, "12:00");
  const lastDay = zonedDateTime(lastDateKey, "12:00");
  return `${format(firstDay, "d 'de' MMM", { locale: ptBR })} a ${format(lastDay, "d 'de' MMM", { locale: ptBR })}`;
}

export default async function SchedulePage({
  searchParams,
}: PageProps<"/dashboard/schedule">) {
  const { week } = await searchParams;
  const weekOffset = parseWeekOffset(week);
  const weekDateKeys = getWeekDateKeys(weekOffset);
  const firstDateKey = weekDateKeys[0] ?? "";
  const lastDateKey = weekDateKeys.at(-1) ?? "";

  const [appointments, patients, settings] = await Promise.all([
    listAppointmentsBetween(firstDateKey, lastDateKey),
    listPatients(),
    getPracticeSettings(),
  ]);

  return (
    <>
      <PageHeader
        title="Agenda"
        description={formatWeekRange(firstDateKey, lastDateKey)}
        actions={<WeekNavigator weekOffset={weekOffset} />}
      />
      <PageContent>
        <ScheduleView
          key={weekOffset}
          weekDateKeys={weekDateKeys}
          initialAppointments={appointments}
          patients={patients}
          cancellationNoticeHours={settings.cancellationNoticeHours}
        />
      </PageContent>
    </>
  );
}
