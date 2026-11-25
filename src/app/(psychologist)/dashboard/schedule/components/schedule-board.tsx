"use client";

import { parseAsString, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CancelAppointmentDialog } from "@/features/appointments/components/cancel-appointment-dialog";
import { RescheduleAppointmentDialog } from "@/features/appointments/components/reschedule-appointment-dialog";
import { useUpdateAppointmentStatusMutation } from "@/features/appointments/hooks/use-update-appointment-status-mutation";
import type { Appointment, AppointmentId } from "@/features/appointments/types";
import { CalendarEventDialog } from "@/features/calendar-events/components/calendar-event-dialog";
import { DeleteCalendarEventDialog } from "@/features/calendar-events/components/delete-calendar-event-dialog";
import type {
  CalendarEvent,
  CalendarEventId,
} from "@/features/calendar-events/types";
import type { SessionNoteSummary } from "@/features/clinical-records/types";
import type { Patient } from "@/features/patients/types";
import {
  type PaymentTarget,
  RegisterPaymentDialog,
} from "@/features/payments/components/register-payment-dialog";
import type { SessionAvailability } from "@/features/practice-settings/availability";
import { toDateKey } from "@/lib/dates";
import {
  listCalendarDateKeys,
  listPendingRequests,
  type ScheduleCalendar,
} from "../schedule-layout";
import { AppointmentDetailsSheet } from "./appointment-details-sheet";
import { MonthGrid } from "./month-grid";
import { PendingRequests } from "./pending-requests";
import { WeekColumns } from "./week-columns";

type ScheduleBoardProps = {
  appointments: Appointment[];
  events: CalendarEvent[];
  patients: Patient[];
  calendar: ScheduleCalendar;
  now: string;
  cancellationNoticeHours: number;
  pixKey: string | null;
  practiceMeetingUrl: string | null;
  availability: SessionAvailability;
  sessionNotes: SessionNoteSummary[];
};

function toPaymentTarget(appointment: Appointment): PaymentTarget {
  return {
    appointmentId: appointment.id,
    patientName: appointment.patientName,
    sessionStartsAt: appointment.startsAt,
    amountCents: appointment.priceCents,
  };
}

export function ScheduleBoard({
  appointments,
  events,
  patients,
  calendar,
  now,
  cancellationNoticeHours,
  pixKey,
  practiceMeetingUrl,
  availability,
  sessionNotes,
}: ScheduleBoardProps) {
  const [selectedAppointmentId, setSelectedAppointmentId] = useQueryState(
    "session",
    parseAsString.withOptions({ history: "replace" }),
  );
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);
  const [appointmentToReschedule, setAppointmentToReschedule] =
    useState<Appointment | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<PaymentTarget | null>(
    null,
  );
  const [selectedEventId, setSelectedEventId] =
    useState<CalendarEventId | null>(null);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(
    null,
  );
  const confirmMutation = useUpdateAppointmentStatusMutation();
  const selectedEvent = events.find(({ id }) => id === selectedEventId) ?? null;

  const visibleDateKeys = useMemo(
    () => new Set(listCalendarDateKeys(calendar)),
    [calendar],
  );
  const visibleAppointments = useMemo(
    () =>
      appointments.filter(({ startsAt }) =>
        visibleDateKeys.has(toDateKey(startsAt)),
      ),
    [appointments, visibleDateKeys],
  );
  const pendingRequests = useMemo(
    () => listPendingRequests(appointments, now),
    [appointments, now],
  );

  const selectedAppointment =
    appointments.find(({ id }) => id === selectedAppointmentId) ?? null;
  const selectedPatient = selectedAppointment
    ? (patients.find(({ id }) => id === selectedAppointment.patientId) ?? null)
    : null;
  const selectedSessionNote = selectedAppointment
    ? (sessionNotes.find(
        ({ appointmentId }) => appointmentId === selectedAppointment.id,
      ) ?? null)
    : null;
  const confirmingAppointmentId = confirmMutation.isPending
    ? (confirmMutation.variables?.appointmentId ?? null)
    : null;

  function handleSelect(appointmentId: AppointmentId) {
    setSelectedAppointmentId(appointmentId);
  }

  function handleEventDialogOpenChange(isOpen: boolean) {
    if (!isOpen) setSelectedEventId(null);
  }

  function handleDeleteEventRequest(event: CalendarEvent) {
    setSelectedEventId(null);
    setEventToDelete(event);
  }

  function handleDeleteEventOpenChange(isOpen: boolean) {
    if (!isOpen) setEventToDelete(null);
  }

  function handleDetailsOpenChange(isOpen: boolean) {
    if (!isOpen) setSelectedAppointmentId(null);
  }

  function handleCancelRequest(appointment: Appointment) {
    setSelectedAppointmentId(null);
    setAppointmentToCancel(appointment);
  }

  function handleCancellationOpenChange(isOpen: boolean) {
    if (!isOpen) setAppointmentToCancel(null);
  }

  function handleRescheduleRequest(appointment: Appointment) {
    setSelectedAppointmentId(null);
    setAppointmentToReschedule(appointment);
  }

  function handleRescheduleOpenChange(isOpen: boolean) {
    if (!isOpen) setAppointmentToReschedule(null);
  }

  function handleRegisterPaymentRequest(appointment: Appointment) {
    setPaymentTarget(toPaymentTarget(appointment));
  }

  function handlePaymentOpenChange(isOpen: boolean) {
    if (!isOpen) setPaymentTarget(null);
  }

  function handleConfirm(appointment: Appointment) {
    confirmMutation.mutate(
      { appointmentId: appointment.id, status: "confirmed" },
      {
        onSuccess: () =>
          toast.success(`Sessão de ${appointment.patientName} confirmada.`),
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:min-h-0 lg:flex-1 lg:flex-row">
      <section
        aria-label="Semana"
        className="flex min-w-0 flex-1 flex-col gap-4 lg:min-h-0"
      >
        {calendar.view === "week" ? (
          <WeekColumns
            dateKeys={calendar.dateKeys}
            appointments={visibleAppointments}
            events={events}
            now={now}
            onSelect={handleSelect}
            onSelectEvent={setSelectedEventId}
            className="lg:min-h-0 lg:flex-1"
          />
        ) : (
          <MonthGrid
            monthKey={calendar.monthKey}
            weeks={calendar.weeks}
            appointments={visibleAppointments}
            events={events}
            now={now}
            onSelect={handleSelect}
            onSelectEvent={setSelectedEventId}
            className="lg:min-h-0 lg:flex-1"
          />
        )}
      </section>

      {pendingRequests.length > 0 && (
        <PendingRequests
          appointments={pendingRequests}
          confirmingAppointmentId={confirmingAppointmentId}
          onConfirm={handleConfirm}
          onCancel={handleCancelRequest}
          className="order-first lg:order-none lg:max-h-full lg:w-80 lg:shrink-0 lg:self-start"
        />
      )}

      <AppointmentDetailsSheet
        appointment={selectedAppointment}
        patient={selectedPatient}
        sessionNote={selectedSessionNote}
        pixKey={pixKey}
        practiceMeetingUrl={practiceMeetingUrl}
        now={now}
        onOpenChange={handleDetailsOpenChange}
        onCancelRequest={handleCancelRequest}
        onRescheduleRequest={handleRescheduleRequest}
        onRegisterPaymentRequest={handleRegisterPaymentRequest}
      />

      {selectedEvent && (
        <CalendarEventDialog
          key={selectedEvent.id}
          isOpen
          event={selectedEvent}
          onOpenChange={handleEventDialogOpenChange}
          onDeleteRequest={handleDeleteEventRequest}
        />
      )}

      <DeleteCalendarEventDialog
        event={eventToDelete}
        onOpenChange={handleDeleteEventOpenChange}
      />

      <RescheduleAppointmentDialog
        appointment={appointmentToReschedule}
        availability={availability}
        onOpenChange={handleRescheduleOpenChange}
      />

      <RegisterPaymentDialog
        target={paymentTarget}
        onOpenChange={handlePaymentOpenChange}
      />

      <CancelAppointmentDialog
        appointment={appointmentToCancel}
        patientPhone={
          patients.find(({ id }) => id === appointmentToCancel?.patientId)
            ?.phone ?? null
        }
        cancellationNoticeHours={cancellationNoticeHours}
        onOpenChange={handleCancellationOpenChange}
      />
    </div>
  );
}
