"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CancelAppointmentDialog,
  type CancelledAppointmentDetails,
} from "@/features/appointments/components/cancel-appointment-dialog";
import type { Appointment, AppointmentId } from "@/features/appointments/types";
import type { Patient } from "@/features/patients/types";
import { isSameDateKey, toDateKey, zonedDateTime } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { AppointmentCard } from "./appointment-card";
import { AppointmentDetailsSheet } from "./appointment-details-sheet";
import { NewAppointmentDialog } from "./new-appointment-dialog";

type ScheduleViewProps = {
  weekDateKeys: string[];
  initialAppointments: Appointment[];
  patients: Patient[];
  cancellationNoticeHours: number;
};

export function ScheduleView({
  weekDateKeys,
  initialAppointments,
  patients,
  cancellationNoticeHours,
}: ScheduleViewProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [selectedAppointmentId, setSelectedAppointmentId] =
    useState<AppointmentId | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const todayKey = toDateKey(new Date());

  const patientsById = useMemo(
    () => new Map(patients.map((patient) => [patient.id, patient])),
    [patients],
  );
  const selectedAppointment =
    appointments.find(({ id }) => id === selectedAppointmentId) ?? null;

  const updateAppointment = useCallback(
    (appointmentId: AppointmentId, changes: Partial<Appointment>) => {
      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, ...changes }
            : appointment,
        ),
      );
    },
    [],
  );

  function handleCancelled({
    reason,
    isLateCancellation,
  }: CancelledAppointmentDetails) {
    if (!appointmentToCancel) return;
    updateAppointment(appointmentToCancel.id, {
      status: "cancelled",
      paymentStatus: "waived",
      cancellation: {
        cancelledAt: new Date().toISOString(),
        cancelledBy: "psychologist",
        reason,
        isLateCancellation,
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button onClick={() => setIsNewAppointmentOpen(true)}>
          <Plus aria-hidden />
          Nova sessão
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-7 lg:gap-3">
        {weekDateKeys.map((dateKey) => {
          const dayAppointments = appointments.filter(({ startsAt }) =>
            isSameDateKey(startsAt, dateKey),
          );
          const day = zonedDateTime(dateKey, "12:00");
          const isToday = dateKey === todayKey;

          return (
            <section
              key={dateKey}
              aria-label={format(day, "EEEE, d 'de' MMMM", { locale: ptBR })}
              className="flex flex-col gap-2"
            >
              <header
                className={cn(
                  "flex items-baseline gap-2 border-b pb-2 lg:flex-col lg:gap-0",
                  isToday && "border-primary",
                )}
              >
                <span className="text-muted-foreground text-xs uppercase tracking-wide">
                  {format(day, "EEE", { locale: ptBR })}
                </span>
                <span
                  className={cn(
                    "font-heading text-2xl",
                    isToday && "text-primary underline underline-offset-4",
                  )}
                >
                  {format(day, "d")}
                </span>
              </header>
              {dayAppointments.length > 0 ? (
                dayAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onSelect={setSelectedAppointmentId}
                  />
                ))
              ) : (
                <p className="py-2 text-muted-foreground text-xs">
                  Sem sessões
                </p>
              )}
            </section>
          );
        })}
      </div>

      <AppointmentDetailsSheet
        appointment={selectedAppointment}
        patient={
          selectedAppointment
            ? (patientsById.get(selectedAppointment.patientId) ?? null)
            : null
        }
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedAppointmentId(null);
        }}
        onStatusUpdated={updateAppointment}
        onCancelRequest={(appointment) => {
          setSelectedAppointmentId(null);
          setAppointmentToCancel(appointment);
        }}
      />

      <CancelAppointmentDialog
        appointment={appointmentToCancel}
        actor="psychologist"
        cancellationNoticeHours={cancellationNoticeHours}
        onOpenChange={(isOpen) => {
          if (!isOpen) setAppointmentToCancel(null);
        }}
        onCancelled={handleCancelled}
      />

      <NewAppointmentDialog
        isOpen={isNewAppointmentOpen}
        onOpenChange={setIsNewAppointmentOpen}
        patients={patients}
      />
    </div>
  );
}
