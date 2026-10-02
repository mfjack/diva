"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarX2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentModalityLabel } from "@/features/appointments/components/appointment-row";
import { AppointmentStatusBadge } from "@/features/appointments/components/appointment-status-badge";
import type { Appointment } from "@/features/appointments/types";
import { formatTime, toAppTimeZone } from "@/lib/format";

type UpcomingAppointmentCardProps = {
  appointment: Appointment;
  onCancel: (appointment: Appointment) => void;
};

export function UpcomingAppointmentCard({
  appointment,
  onCancel,
}: UpcomingAppointmentCardProps) {
  const startsAt = toAppTimeZone(appointment.startsAt);

  return (
    <article className="flex h-full flex-col gap-5 rounded-xl border p-5">
      <div className="flex items-start gap-4">
        <div className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-secondary py-2">
          <span className="text-muted-foreground text-xs uppercase">
            {format(startsAt, "MMM", { locale: ptBR })}
          </span>
          <span className="font-heading text-3xl leading-none">
            {format(startsAt, "d")}
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="font-medium first-letter:uppercase">
            {format(startsAt, "EEEE", { locale: ptBR })},{" "}
            {formatTime(appointment.startsAt)} às{" "}
            {formatTime(appointment.endsAt)}
          </span>
          <AppointmentModalityLabel modality={appointment.modality} />
        </div>
        <AppointmentStatusBadge status={appointment.status} />
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        {appointment.meetingUrl && (
          <Button
            nativeButton={false}
            render={
              <a
                href={appointment.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <Video aria-hidden />
            Entrar na sala
          </Button>
        )}
        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => onCancel(appointment)}
        >
          <CalendarX2 aria-hidden />
          Cancelar
        </Button>
      </div>
    </article>
  );
}
