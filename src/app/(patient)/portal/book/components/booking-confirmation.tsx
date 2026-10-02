import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APPOINTMENT_MODALITY_LABELS } from "@/features/appointments/labels";
import type { AppointmentModality } from "@/features/appointments/types";
import type { AvailableSlot } from "@/features/booking/available-slots";
import { formatLongDate, formatTime } from "@/lib/format";
import { ROUTES } from "@/lib/routes";

type BookingConfirmationProps = {
  slot: AvailableSlot;
  modality: AppointmentModality;
  officeAddress: string | null;
};

export function BookingConfirmation({
  slot,
  modality,
  officeAddress,
}: BookingConfirmationProps) {
  return (
    <section
      aria-live="polite"
      className="flex max-w-lg flex-col items-start gap-6 rounded-xl border p-6 md:p-8"
    >
      <CircleCheck aria-hidden className="size-10 text-success" />
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-4xl">Sessão agendada</h2>
        <p className="text-lg first-letter:uppercase">
          {formatLongDate(slot.startsAt)}, às {formatTime(slot.startsAt)}
        </p>
        <p className="text-muted-foreground">
          {modality === "online"
            ? "Online. O link da sala aparece na sua página inicial no dia da sessão."
            : `${APPOINTMENT_MODALITY_LABELS[modality]}${officeAddress ? ` · ${officeAddress}` : ""}`}
        </p>
        <p className="text-muted-foreground text-sm">
          Você vai receber um lembrete um dia antes e uma hora antes.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          nativeButton={false}
          render={<Link href={ROUTES.patient.appointments} />}
        >
          Ver minhas consultas
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={ROUTES.patient.home} />}
        >
          Voltar ao início
        </Button>
      </div>
    </section>
  );
}
