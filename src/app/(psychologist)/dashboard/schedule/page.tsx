import type { Metadata } from "next";
import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import {
  listAppointmentsBetween,
  listAwaitingConfirmation,
} from "@/features/appointments/queries";
import { listLatestSessionNotes } from "@/features/clinical-records/queries";
import { listPatients } from "@/features/patients/queries";
import {
  getPracticeSettings,
  listAvailabilityRules,
} from "@/features/practice-settings/queries";
import { getWeekDateKeys, parseWeekOffset } from "@/lib/week";
import { MissingAvailabilityNotice } from "./components/missing-availability-notice";
import { NewAppointmentButton } from "./components/new-appointment-button";
import { ScheduleBoard } from "./components/schedule-board";
import { WeekNavigator } from "./components/week-navigator";
import {
  formatWeekRange,
  getVisibleDateKeys,
  getWeekLabel,
  mergeAppointments,
} from "./schedule-layout";

export const metadata: Metadata = {
  title: "Agenda",
};

export default async function SchedulePage({
  searchParams,
}: PageProps<"/dashboard/schedule">) {
  const { week } = await searchParams;
  const weekOffset = parseWeekOffset(week);
  const weekDateKeys = getWeekDateKeys(weekOffset);
  const firstDateKey = weekDateKeys[0] ?? "";
  const lastDateKey = weekDateKeys.at(-1) ?? "";

  const [
    weekAppointments,
    awaitingConfirmation,
    patients,
    settings,
    rules,
    latestSessionNotes,
  ] = await Promise.all([
    listAppointmentsBetween(firstDateKey, lastDateKey),
    listAwaitingConfirmation(),
    listPatients(),
    getPracticeSettings(),
    listAvailabilityRules(),
    listLatestSessionNotes(),
  ]);

  const visibleDateKeys = getVisibleDateKeys(
    weekDateKeys,
    rules,
    weekAppointments,
  );
  const availability = {
    rules,
    sessionDurationMinutes: settings.sessionDurationMinutes,
  };

  if (rules.length === 0) {
    return (
      <>
        <PageHeader title="Agenda" />
        <PageContent>
          <MissingAvailabilityNotice />
        </PageContent>
      </>
    );
  }

  return (
    <div className="flex flex-1 flex-col lg:h-svh lg:flex-none lg:overflow-hidden">
      <PageHeader
        title="Agenda"
        description={
          <>
            <span className="font-medium text-foreground">
              {getWeekLabel(weekOffset)}
            </span>{" "}
            ·{" "}
            {formatWeekRange(
              visibleDateKeys[0] ?? firstDateKey,
              visibleDateKeys.at(-1) ?? lastDateKey,
            )}
          </>
        }
        actions={
          <>
            <WeekNavigator weekOffset={weekOffset} />
            <NewAppointmentButton
              patients={patients}
              availability={availability}
            />
          </>
        }
      />
      <PageContent className="lg:min-h-0 lg:pb-6">
        <ScheduleBoard
          appointments={mergeAppointments(
            weekAppointments,
            awaitingConfirmation,
          )}
          patients={patients}
          dateKeys={visibleDateKeys}
          now={new Date().toISOString()}
          cancellationNoticeHours={settings.cancellationNoticeHours}
          pixKey={settings.pixKey}
          practiceMeetingUrl={settings.meetingUrl}
          availability={availability}
          latestSessionNotes={latestSessionNotes}
        />
      </PageContent>
    </div>
  );
}
