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
  insertMockAppointment,
  updateMockAppointment,
} from "@/mocks/appointments";
import {
  insertMockPayment,
  updateMockPaymentSession,
  waiveMockPayment,
} from "@/mocks/payments";
import { isLateCancellation } from "./cancellation-policy";
import { APPOINTMENT_ACTION_MESSAGES } from "./messages";
import {
  getAppointment,
  getSessionPlan,
  hasConflictingAppointment,
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
import { canChangeSchedule, canUpdateStatus } from "./status-transitions";
import type { Appointment, AppointmentId, AppointmentSeriesId } from "./types";

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

  updateMockAppointment(appointment.id, { status: parsedStatus.data });
  revalidateAppointmentViews();
  return actionSuccess();
}

export type CancelledSessionsSummary = {
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
  const cancelledAt = new Date().toISOString();
  const reason = formatCancellationReason(parsedInput.data);
  for (const appointmentToCancel of appointmentsToCancel) {
    updateMockAppointment(appointmentToCancel.id, {
      status: "cancelled",
      cancellation: {
        cancelledAt,
        cancelledBy: "psychologist",
        reason,
        isLateCancellation: isLateCancellation(
          appointmentToCancel.startsAt,
          cancellationNoticeHours,
        ),
      },
    });
    waiveMockPayment(appointmentToCancel.id);
  }
  revalidateAppointmentViews();
  return actionSuccess({ cancelledCount: appointmentsToCancel.length });
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

  updateMockAppointment(lookup.entity.id, {
    meetingUrl: emptyToNull(parsedInput.data.meetingUrl),
  });
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

  const seriesId =
    planInput.repeat === "none"
      ? null
      : (crypto.randomUUID() as AppointmentSeriesId);
  for (const { startsAt, endsAt } of bookableSessions) {
    const appointment = {
      id: crypto.randomUUID() as AppointmentId,
      patientId: patient.id,
      patientName: patient.fullName,
      seriesId,
      startsAt,
      endsAt,
      modality: patient.preferredModality,
      status: "confirmed",
      priceCents: patient.sessionPriceCents,
      paymentStatus: "pending",
      meetingUrl: null,
      cancellation: null,
    } satisfies Appointment;
    insertMockAppointment(appointment);
    insertMockPayment(appointment);
  }
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
  if (
    await hasConflictingAppointment(
      startsAt.toISOString(),
      endsAt.toISOString(),
      appointment.id,
    )
  ) {
    return actionFailure(APPOINTMENT_ACTION_MESSAGES.conflict);
  }

  updateMockAppointment(appointment.id, {
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
  });
  updateMockPaymentSession(appointment.id, startsAt.toISOString());
  revalidateAppointmentViews();
  return actionSuccess();
}
