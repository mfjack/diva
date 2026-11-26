"use server";

import { revalidatePath } from "next/cache";
import { findAuthorizedEntity } from "@/features/auth/authorized-entity";
import {
  INVALID_FORM_MESSAGE,
  UNAUTHORIZED_MESSAGE,
} from "@/features/auth/errors";
import { getAuthorizedPsychologist } from "@/features/auth/queries";
import { getPatient } from "@/features/patients/queries";
import {
  type BusyInterval,
  isWithinAvailability,
  overlaps,
} from "@/features/practice-settings/availability";
import {
  getPracticeSettings,
  listAvailabilityRules,
} from "@/features/practice-settings/queries";
import {
  type ActionResult,
  actionFailure,
  actionSuccess,
} from "@/lib/action-result";
import { zonedDateTime } from "@/lib/dates";
import { ROUTES } from "@/lib/routes";
import { emptyToNull } from "@/lib/strings";
import {
  DATABASE_ERROR_CODES,
  hasDatabaseErrorCode,
} from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";
import { isLateCancellation } from "./cancellation-policy";
import { APPOINTMENT_ACTION_MESSAGES } from "./messages";
import {
  getAppointment,
  getSessionPlan,
  listBusyIntervalsOn,
  listFollowingSeriesAppointments,
} from "./queries";
import {
  listBookableSessions,
  type PlannedSession,
} from "./recurring-sessions";
import {
  type AppointmentStatusUpdate,
  appointmentStatusUpdateSchema,
  type BusyIntervalsInput,
  busyIntervalsSchema,
  type CancelAppointmentInput,
  type CreateAppointmentInput,
  cancelAppointmentSchema,
  createAppointmentSchema,
  formatCancellationReason,
  type MeetingLinkInput,
  meetingLinkSchema,
  type RescheduleAppointmentInput,
  rescheduleAppointmentSchema,
  type SessionPlanSchemaInput,
  sessionPlanSchema,
} from "./schemas";
import {
  canChangeSchedule,
  canUpdateStatus,
  isOpenAppointment,
} from "./status-transitions";
import type { AppointmentId } from "./types";

function findAuthorizedAppointment(appointmentId: string) {
  return findAuthorizedEntity(
    appointmentId,
    getAppointment,
    APPOINTMENT_ACTION_MESSAGES.notFound,
  );
}

function revalidateAppointmentViews() {
  revalidatePath(ROUTES.psychologist.dashboard, "layout");
}

function getScheduleFailure(error: { code?: string } | null): string {
  if (hasDatabaseErrorCode(error, DATABASE_ERROR_CODES.exclusionViolation)) {
    return APPOINTMENT_ACTION_MESSAGES.conflict;
  }
  if (hasDatabaseErrorCode(error, DATABASE_ERROR_CODES.notFound)) {
    return APPOINTMENT_ACTION_MESSAGES.notFound;
  }
  return APPOINTMENT_ACTION_MESSAGES.saveFailed;
}

export async function updateAppointmentStatus(
  appointmentId: AppointmentId,
  status: AppointmentStatusUpdate,
): Promise<ActionResult> {
  const lookup = await findAuthorizedAppointment(appointmentId);
  if (!lookup.isFound) return lookup.failure;
  const parsedStatus = appointmentStatusUpdateSchema.safeParse(status);
  if (!parsedStatus.success) return actionFailure(INVALID_FORM_MESSAGE);

  const appointment = lookup.entity;
  if (!canUpdateStatus(appointment, parsedStatus.data)) {
    return actionFailure(APPOINTMENT_ACTION_MESSAGES.invalidTransition);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .update({ status: parsedStatus.data })
    .eq("id", appointment.id);
  if (error) return actionFailure(getScheduleFailure(error));
  revalidateAppointmentViews();
  return actionSuccess();
}

type CancelledSessionsSummary = {
  cancelledCount: number;
};

export async function cancelAppointment(
  appointmentId: AppointmentId,
  input: CancelAppointmentInput,
): Promise<ActionResult<CancelledSessionsSummary>> {
  const lookup = await findAuthorizedAppointment(appointmentId);
  if (!lookup.isFound) return lookup.failure;
  const parsedInput = cancelAppointmentSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  const appointment = lookup.entity;
  if (!canChangeSchedule(appointment)) {
    return actionFailure(APPOINTMENT_ACTION_MESSAGES.invalidTransition);
  }

  const appointmentsToCancel =
    parsedInput.data.scope === "following" && appointment.seriesId !== null
      ? (
          await listFollowingSeriesAppointments(
            appointment.seriesId,
            appointment.startsAt,
          )
        ).filter((seriesAppointment) => canChangeSchedule(seriesAppointment))
      : [appointment];

  const { cancellationNoticeHours } = await getPracticeSettings();
  const supabase = await createClient();
  const { data: cancelledCount, error } = await supabase.rpc(
    "cancel_appointments",
    {
      p_reason: formatCancellationReason(parsedInput.data),
      p_cancelled_by: parsedInput.data.cancelledBy,
      p_cancellations: appointmentsToCancel.map(({ id, startsAt }) => ({
        id,
        is_late: isLateCancellation(startsAt, cancellationNoticeHours),
      })),
    },
  );
  if (error) return actionFailure(getScheduleFailure(error));
  revalidateAppointmentViews();
  return actionSuccess({ cancelledCount });
}

export async function previewSessionPlan(
  input: SessionPlanSchemaInput,
): Promise<ActionResult<PlannedSession[]>> {
  if (!(await getAuthorizedPsychologist())) {
    return actionFailure(UNAUTHORIZED_MESSAGE);
  }
  const parsedInput = sessionPlanSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);
  return actionSuccess(await getSessionPlan(parsedInput.data));
}

export async function listBusyIntervals(
  input: BusyIntervalsInput,
): Promise<ActionResult<BusyInterval[]>> {
  if (!(await getAuthorizedPsychologist())) {
    return actionFailure(UNAUTHORIZED_MESSAGE);
  }
  const parsedInput = busyIntervalsSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);
  const { date, ignoredAppointmentId } = parsedInput.data;
  return actionSuccess(await listBusyIntervalsOn(date, ignoredAppointmentId));
}

export async function updateMeetingLink(
  appointmentId: AppointmentId,
  input: MeetingLinkInput,
): Promise<ActionResult> {
  const lookup = await findAuthorizedAppointment(appointmentId);
  if (!lookup.isFound) return lookup.failure;
  const parsedInput = meetingLinkSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);
  if (lookup.entity.modality !== "online") {
    return actionFailure(APPOINTMENT_ACTION_MESSAGES.notOnline);
  }
  if (!isOpenAppointment(lookup.entity.status)) {
    return actionFailure(APPOINTMENT_ACTION_MESSAGES.invalidTransition);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .update({ meeting_url: emptyToNull(parsedInput.data.meetingUrl) })
    .eq("id", lookup.entity.id);
  if (error) return actionFailure(getScheduleFailure(error));
  revalidateAppointmentViews();
  return actionSuccess();
}

export type CreatedSessionsSummary = {
  createdCount: number;
  skippedSessions: PlannedSession[];
};

function getSingleSessionFailure(session: PlannedSession | undefined): string {
  if (session?.skipReason === "past") {
    return APPOINTMENT_ACTION_MESSAGES.pastDate;
  }
  if (session?.skipReason === "unavailable") {
    return APPOINTMENT_ACTION_MESSAGES.unavailable;
  }
  if (session?.skipReason === "conflict") {
    return APPOINTMENT_ACTION_MESSAGES.conflict;
  }
  return APPOINTMENT_ACTION_MESSAGES.noBookableSession;
}

export async function createAppointment(
  input: CreateAppointmentInput,
): Promise<ActionResult<CreatedSessionsSummary>> {
  if (!(await getAuthorizedPsychologist())) {
    return actionFailure(UNAUTHORIZED_MESSAGE);
  }
  const parsedInput = createAppointmentSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  const { patientId, excludedDates, ...planInput } = parsedInput.data;
  const [patient, sessions] = await Promise.all([
    getPatient(patientId),
    getSessionPlan(planInput),
  ]);
  if (!patient) return actionFailure(APPOINTMENT_ACTION_MESSAGES.notFound);

  const bookableSessions = listBookableSessions(sessions, excludedDates);
  if (bookableSessions.length === 0) {
    return actionFailure(
      planInput.repeat === "none"
        ? getSingleSessionFailure(sessions[0])
        : APPOINTMENT_ACTION_MESSAGES.noBookableSession,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_appointments", {
    p_patient_id: patient.id,
    p_sessions: bookableSessions.map(({ startsAt, endsAt }) => ({
      starts_at: startsAt,
      ends_at: endsAt,
    })),
    ...(planInput.repeat === "none"
      ? {}
      : {
          p_repeat: planInput.repeat,
          p_series_starts_on: sessions[0]?.dateKey,
          p_series_ends_on: sessions.at(-1)?.dateKey,
        }),
  });
  if (error) return actionFailure(getScheduleFailure(error));
  revalidateAppointmentViews();
  return actionSuccess({
    createdCount: bookableSessions.length,
    skippedSessions: sessions.filter(({ skipReason }) => skipReason !== null),
  });
}

export async function rescheduleAppointment(
  appointmentId: AppointmentId,
  input: RescheduleAppointmentInput,
): Promise<ActionResult> {
  const lookup = await findAuthorizedAppointment(appointmentId);
  if (!lookup.isFound) return lookup.failure;
  const parsedInput = rescheduleAppointmentSchema.safeParse(input);
  if (!parsedInput.success) return actionFailure(INVALID_FORM_MESSAGE);

  const appointment = lookup.entity;
  if (!canChangeSchedule(appointment)) {
    return actionFailure(APPOINTMENT_ACTION_MESSAGES.invalidTransition);
  }

  const { date, time } = parsedInput.data;
  const startsAt = zonedDateTime(date, time);
  if (startsAt.getTime() <= Date.now()) {
    return actionFailure(APPOINTMENT_ACTION_MESSAGES.pastDate);
  }
  const [settings, rules] = await Promise.all([
    getPracticeSettings(),
    listAvailabilityRules(),
  ]);
  const availability = {
    rules,
    sessionDurationMinutes: settings.sessionDurationMinutes,
  };
  if (!isWithinAvailability(availability, date, time)) {
    return actionFailure(APPOINTMENT_ACTION_MESSAGES.unavailable);
  }
  const durationInMs =
    new Date(appointment.endsAt).getTime() -
    new Date(appointment.startsAt).getTime();
  const endsAt = new Date(startsAt.getTime() + durationInMs);
  const newPeriod = {
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
  };
  const busyIntervals = await listBusyIntervalsOn(date, appointment.id);
  if (busyIntervals.some((busy) => overlaps(newPeriod, busy))) {
    return actionFailure(APPOINTMENT_ACTION_MESSAGES.conflict);
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .update({
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    })
    .eq("id", appointment.id);
  if (error) return actionFailure(getScheduleFailure(error));
  revalidateAppointmentViews();
  return actionSuccess();
}
