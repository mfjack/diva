"use client";

import { CalendarPlus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyListMessage } from "@/components/feedback/empty-list-message";
import { Button } from "@/components/ui/button";
import { UrlTabs } from "@/components/url-tabs";
import {
  CancelAppointmentDialog,
  type CancelledAppointmentDetails,
} from "@/features/appointments/components/cancel-appointment-dialog";
import type { Appointment } from "@/features/appointments/types";
import { splitAppointmentsByTime } from "@/features/appointments/upcoming";
import { ROUTES } from "@/lib/routes";
import { PastAppointmentItem } from "./past-appointment-item";
import { UpcomingAppointmentCard } from "./upcoming-appointment-card";

type PatientAppointmentsViewProps = {
  initialAppointments: Appointment[];
  cancellationNoticeHours: number;
};

export function PatientAppointmentsView({
  initialAppointments,
  cancellationNoticeHours,
}: PatientAppointmentsViewProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);
  const { upcoming, past } = useMemo(
    () => splitAppointmentsByTime(appointments),
    [appointments],
  );

  function handleCancelled({
    reason,
    isLateCancellation,
  }: CancelledAppointmentDetails) {
    if (!appointmentToCancel) return;
    const cancelledId = appointmentToCancel.id;
    setAppointments((currentAppointments) =>
      currentAppointments.map((appointment) =>
        appointment.id === cancelledId
          ? {
              ...appointment,
              status: "cancelled",
              paymentStatus: isLateCancellation ? "pending" : "waived",
              cancellation: {
                cancelledAt: new Date().toISOString(),
                cancelledBy: "patient",
                reason,
                isLateCancellation,
              },
            }
          : appointment,
      ),
    );
  }

  return (
    <>
      <UrlTabs
        tabs={[
          {
            value: "upcoming",
            label: `Próximas (${upcoming.length})`,
            content:
              upcoming.length > 0 ? (
                <ul className="grid gap-4 md:grid-cols-2">
                  {upcoming.map((appointment) => (
                    <li key={appointment.id}>
                      <UpcomingAppointmentCard
                        appointment={appointment}
                        onCancel={setAppointmentToCancel}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed px-4 py-10 text-center">
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
              ),
          },
          {
            value: "past",
            label: "Histórico",
            content:
              past.length > 0 ? (
                <ul className="divide-y rounded-xl border px-4">
                  {past.map((appointment) => (
                    <PastAppointmentItem
                      key={appointment.id}
                      appointment={appointment}
                    />
                  ))}
                </ul>
              ) : (
                <EmptyListMessage message="Nenhuma sessão no histórico." />
              ),
          },
        ]}
      />
      <CancelAppointmentDialog
        appointment={appointmentToCancel}
        actor="patient"
        cancellationNoticeHours={cancellationNoticeHours}
        onOpenChange={(isOpen) => {
          if (!isOpen) setAppointmentToCancel(null);
        }}
        onCancelled={handleCancelled}
      />
    </>
  );
}
