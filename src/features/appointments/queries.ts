import "server-only";

import type { QueryData } from "@supabase/supabase-js";
import { z } from "zod";
import { getCurrentUser } from "@/features/auth/queries";
import { listCalendarEventsBetween } from "@/features/calendar-events/queries";
import type { PatientId } from "@/features/patients/types";
import type { BusyInterval } from "@/features/practice-settings/availability";
import {
  getPracticeSettings,
  listAvailabilityBlocks,
  listAvailabilityRules,
} from "@/features/practice-settings/queries";
import { addDaysToDateKey, zonedDateTime } from "@/lib/dates";
import type { Cents } from "@/lib/money";
import { assertNoDatabaseError } from "@/lib/supabase/errors";
import { createClient, type SupabaseServerClient } from "@/lib/supabase/server";
import { completeFinishedAppointments } from "./finished-appointments";
import {
  type PlannedSession,
  planSessionDateKeys,
  planSessions,
  type SessionPlanInput,
} from "./recurring-sessions";
import type { Appointment, AppointmentId, AppointmentSeriesId } from "./types";

const APPOINTMENT_COLUMNS = `
  id,
  patient_id,
  series_id,
  starts_at,
  ends_at,
  modality,
  status,
  price_cents,
  meeting_url,
  cancelled_at,
  cancelled_by,
  cancellation_reason,
  is_late_cancellation,
  patient:patients!appointments_patient_id_fkey (full_name),
  payment:payments!payments_appointment_id_fkey (status)
`;

const DAY_START_TIME = "00:00";

const appointmentIdSchema = z.uuid();

function selectAppointments(supabase: SupabaseServerClient) {
  return supabase.from("appointments").select(APPOINTMENT_COLUMNS);
}

type AppointmentRow = QueryData<ReturnType<typeof selectAppointments>>[number];

async function getAppointmentsClient(): Promise<SupabaseServerClient> {
  await completeFinishedAppointments();
  return createClient();
}

function toAppointment(row: AppointmentRow): Appointment {
  const isCancelled =
    row.status === "cancelled" &&
    row.cancelled_at !== null &&
    row.cancelled_by !== null &&
    row.cancellation_reason !== null;
  return {
    id: row.id as AppointmentId,
    patientId: row.patient_id as PatientId,
    patientName: row.patient?.full_name ?? "",
    seriesId: row.series_id as AppointmentSeriesId | null,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    modality: row.modality,
    status: row.status,
    priceCents: row.price_cents as Cents,
    paymentStatus: row.payment?.status ?? "pending",
    meetingUrl: row.meeting_url,
    cancellation: isCancelled
      ? {
          cancelledAt: row.cancelled_at ?? "",
          cancelledBy: row.cancelled_by ?? "psychologist",
          reason: row.cancellation_reason ?? "",
          isLateCancellation: row.is_late_cancellation,
        }
      : null,
  };
}

function toAppointments(rows: AppointmentRow[] | null): Appointment[] {
  return (rows ?? []).map(toAppointment);
}

function getDayStart(dateKey: string): string {
  return zonedDateTime(dateKey, DAY_START_TIME).toISOString();
}

export async function listAppointmentsBetween(
  startDateKey: string,
  endDateKey: string,
): Promise<Appointment[]> {
  if (!(await getCurrentUser())) return [];
  const supabase = await getAppointmentsClient();
  const { data, error } = await selectAppointments(supabase)
    .gte("starts_at", getDayStart(startDateKey))
    .lt("starts_at", getDayStart(addDaysToDateKey(endDateKey, 1)))
    .order("starts_at");
  assertNoDatabaseError(error);
  return toAppointments(data);
}

export async function listPatientAppointments(
  patientId: PatientId,
): Promise<Appointment[]> {
  if (!(await getCurrentUser())) return [];
  const supabase = await getAppointmentsClient();
  const { data, error } = await selectAppointments(supabase)
    .eq("patient_id", patientId)
    .order("starts_at", { ascending: false });
  assertNoDatabaseError(error);
  return toAppointments(data);
}

export async function listAwaitingConfirmation(): Promise<Appointment[]> {
  if (!(await getCurrentUser())) return [];
  const supabase = await getAppointmentsClient();
  const { data, error } = await selectAppointments(supabase)
    .eq("status", "scheduled")
    .gt("starts_at", new Date().toISOString())
    .order("starts_at");
  assertNoDatabaseError(error);
  return toAppointments(data);
}

export async function getAppointment(
  appointmentId: string,
): Promise<Appointment | null> {
  const parsedId = appointmentIdSchema.safeParse(appointmentId);
  if (!parsedId.success || !(await getCurrentUser())) return null;
  const supabase = await getAppointmentsClient();
  const { data, error } = await selectAppointments(supabase)
    .eq("id", parsedId.data)
    .maybeSingle();
  assertNoDatabaseError(error);
  return data ? toAppointment(data) : null;
}

export async function listBusyIntervalsOn(
  dateKey: string,
  ignoredAppointmentId?: string,
): Promise<BusyInterval[]> {
  const [appointments, events] = await Promise.all([
    listAppointmentsBetween(dateKey, dateKey),
    listCalendarEventsBetween(dateKey, dateKey),
  ]);
  return [
    ...appointments.filter(
      ({ id, status }) => id !== ignoredAppointmentId && status !== "cancelled",
    ),
    ...events,
  ].map(({ startsAt, endsAt }) => ({ startsAt, endsAt }));
}

export async function getSessionPlan(
  input: SessionPlanInput,
): Promise<PlannedSession[]> {
  const dateKeys = planSessionDateKeys(input);
  const firstDateKey = dateKeys[0] ?? input.date;
  const lastDateKey = dateKeys.at(-1) ?? input.date;
  const periodStartKey = addDaysToDateKey(firstDateKey, -1);
  const periodEndKey = addDaysToDateKey(lastDateKey, 1);
  const [settings, rules, appointments, events, blocks] = await Promise.all([
    getPracticeSettings(),
    listAvailabilityRules(),
    listAppointmentsBetween(periodStartKey, periodEndKey),
    listCalendarEventsBetween(periodStartKey, periodEndKey),
    listAvailabilityBlocks(),
  ]);

  return planSessions(input, {
    availability: {
      rules,
      sessionDurationMinutes: settings.sessionDurationMinutes,
    },
    appointments: [
      ...appointments.filter(({ status }) => status !== "cancelled"),
      ...events,
    ],
    blocks,
    now: Date.now(),
  });
}

export async function listFollowingSeriesAppointments(
  seriesId: AppointmentSeriesId,
  fromStartsAt: string,
): Promise<Appointment[]> {
  const supabase = await getAppointmentsClient();
  const { data, error } = await selectAppointments(supabase)
    .eq("series_id", seriesId)
    .gte("starts_at", fromStartsAt)
    .order("starts_at");
  assertNoDatabaseError(error);
  return toAppointments(data);
}
