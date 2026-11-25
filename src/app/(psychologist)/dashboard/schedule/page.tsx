import type { Metadata } from "next";
import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import {
  listAppointmentsBetween,
  listAwaitingConfirmation,
} from "@/features/appointments/queries";
import { listCalendarEventsBetween } from "@/features/calendar-events/queries";
import { listSessionNotes } from "@/features/clinical-records/queries";
import { listPatients } from "@/features/patients/queries";
import {
  getPracticeSettings,
  listAvailabilityRules,
} from "@/features/practice-settings/queries";
import { formatMonthLabel } from "@/lib/months";
import {
  getMonthWeeks,
  getWeekDateKeys,
  parseCalendarOffset,
} from "@/lib/week";
import { MissingAvailabilityNotice } from "./components/missing-availability-notice";
import { NewAppointmentButton } from "./components/new-appointment-button";
import { NewEventButton } from "./components/new-event-button";
import { ScheduleBoard } from "./components/schedule-board";
import { ScheduleNavigator } from "./components/schedule-navigator";
import { ScheduleViewSwitch } from "./components/schedule-view-switch";
import {
  formatWeekRange,
  getPeriodLabel,
  getVisibleDateKeys,
  getVisibleMonthWeeks,
  mergeAppointments,
  parseScheduleView,
  type ScheduleCalendar,
} from "./schedule-layout";

export const metadata: Metadata = {
  title: "Agenda",
};

export default async function SchedulePage({
  searchParams,
}: PageProps<"/dashboard/schedule">) {
  const params = await searchParams;
  const view = parseScheduleView(params.view);
  const offset = parseCalendarOffset(
    view === "month" ? params.month : params.week,
  );
  const weekDateKeys = view === "week" ? getWeekDateKeys(offset) : [];
  const monthWeeks = view === "month" ? getMonthWeeks(offset) : null;
  const periodDateKeys = monthWeeks ? monthWeeks.weeks.flat() : weekDateKeys;
  const firstDateKey = periodDateKeys[0] ?? "";
  const lastDateKey = periodDateKeys.at(-1) ?? "";

  const [
    periodAppointments,
    awaitingConfirmation,
    patients,
    settings,
    rules,
    sessionNotes,
    periodEvents,
  ] = await Promise.all([
    listAppointmentsBetween(firstDateKey, lastDateKey),
    listAwaitingConfirmation(),
    listPatients(),
    getPracticeSettings(),
    listAvailabilityRules(),
    listSessionNotes(),
    listCalendarEventsBetween(firstDateKey, lastDateKey),
  ]);

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

  const calendar: ScheduleCalendar = monthWeeks
    ? {
        view: "month",
        monthKey: monthWeeks.monthKey,
        weeks: getVisibleMonthWeeks(
          monthWeeks.weeks,
          rules,
          periodAppointments,
        ),
      }
    : {
        view: "week",
        dateKeys: getVisibleDateKeys(weekDateKeys, rules, periodAppointments),
      };
  const periodDescription =
    calendar.view === "month"
      ? formatMonthLabel(calendar.monthKey)
      : formatWeekRange(
          calendar.dateKeys[0] ?? firstDateKey,
          calendar.dateKeys.at(-1) ?? lastDateKey,
        );

  return (
    <div className="flex flex-1 flex-col lg:h-svh lg:flex-none lg:overflow-hidden">
      <PageHeader
        title="Agenda"
        description={
          <>
            <span className="font-medium text-foreground">
              {getPeriodLabel(view, offset)}
            </span>{" "}
            · {periodDescription}
          </>
        }
        actions={
          <>
            <ScheduleViewSwitch view={view} />
            <ScheduleNavigator view={view} offset={offset} />
            <NewEventButton />
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
            periodAppointments,
            awaitingConfirmation,
          )}
          events={periodEvents}
          patients={patients}
          calendar={calendar}
          now={new Date().toISOString()}
          cancellationNoticeHours={settings.cancellationNoticeHours}
          pixKey={settings.pixKey}
          practiceMeetingUrl={settings.meetingUrl}
          availability={availability}
          sessionNotes={sessionNotes}
        />
      </PageContent>
    </div>
  );
}
