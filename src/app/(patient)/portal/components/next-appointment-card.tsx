import { Video } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppointmentModalityLabel } from "@/features/appointments/components/appointment-row";
import { APPOINTMENT_STATUS_LABELS } from "@/features/appointments/labels";
import type { Appointment } from "@/features/appointments/types";
import { formatLongDate, formatTime } from "@/lib/format";
import { ROUTES } from "@/lib/routes";

type NextAppointmentCardProps = {
  appointment: Appointment;
};

export function NextAppointmentCard({ appointment }: NextAppointmentCardProps) {
  return (
    <article className="flex flex-col gap-6 rounded-xl bg-primary p-6 text-primary-foreground md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-3">
        <span className="font-medium text-primary-foreground/70 text-xs uppercase tracking-wider">
          {APPOINTMENT_STATUS_LABELS[appointment.status]}
        </span>
        <div className="flex flex-col gap-1">
          <p className="font-heading text-4xl leading-tight first-letter:uppercase">
            {formatLongDate(appointment.startsAt)}
          </p>
          <p className="text-lg text-primary-foreground/80">
            {formatTime(appointment.startsAt)} às{" "}
            {formatTime(appointment.endsAt)}
          </p>
        </div>
        <div className="text-primary-foreground/80 [&_span]:text-primary-foreground/80">
          <AppointmentModalityLabel modality={appointment.modality} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {appointment.meetingUrl && (
          <Button
            variant="secondary"
            className="h-11 px-5"
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
          className="h-11 px-5 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          nativeButton={false}
          render={<Link href={ROUTES.patient.appointments} />}
        >
          Remarcar ou cancelar
        </Button>
      </div>
    </article>
  );
}
