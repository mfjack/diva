"use client";

import { CalendarCheck } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { APPOINTMENT_MODALITY_LABELS } from "@/features/appointments/labels";
import type { AppointmentModality } from "@/features/appointments/types";
import type { AvailableSlot } from "@/features/booking/available-slots";
import { formatCurrency, formatLongDate, formatTime } from "@/lib/format";
import type { Cents } from "@/lib/money";

const MODALITIES = [
  "in_person",
  "online",
] as const satisfies AppointmentModality[];

type BookingSummaryProps = {
  slot: AvailableSlot;
  modality: AppointmentModality | null;
  onChooseModality: (modality: AppointmentModality) => void;
  priceCents: Cents;
  cancellationNoticeHours: number;
  isSubmitting: boolean;
  onConfirm: () => void;
};

export function BookingSummary({
  slot,
  modality,
  onChooseModality,
  priceCents,
  cancellationNoticeHours,
  isSubmitting,
  onConfirm,
}: BookingSummaryProps) {
  const radioGroupId = useId();
  const isModalityChoosable = slot.modality === null;

  return (
    <section className="flex flex-col gap-5 rounded-xl border p-5">
      <h2 className="font-semibold">3. Confirme</h2>

      {isModalityChoosable && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 font-medium text-sm">
            Como você prefere?
          </legend>
          <RadioGroup
            value={modality}
            onValueChange={(value) =>
              onChooseModality(value as AppointmentModality)
            }
            className="grid grid-cols-2 gap-2"
          >
            {MODALITIES.map((option) => (
              <Label
                key={option}
                htmlFor={`${radioGroupId}-${option}`}
                className="flex h-12 items-center gap-3 rounded-lg border px-4 has-data-checked:border-primary"
              >
                <RadioGroupItem
                  id={`${radioGroupId}-${option}`}
                  value={option}
                />
                {APPOINTMENT_MODALITY_LABELS[option]}
              </Label>
            ))}
          </RadioGroup>
        </fieldset>
      )}

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Quando</dt>
          <dd className="text-right first-letter:uppercase">
            {formatLongDate(slot.startsAt)}, {formatTime(slot.startsAt)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Modalidade</dt>
          <dd>
            {modality ? APPOINTMENT_MODALITY_LABELS[modality] : "Escolha acima"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Valor</dt>
          <dd className="font-medium tabular-nums">
            {formatCurrency(priceCents)}
          </dd>
        </div>
      </dl>

      <p className="rounded-lg bg-muted p-3 text-muted-foreground text-xs">
        Você pode cancelar sem custo até {cancellationNoticeHours}h antes.
        Depois disso, a sessão é cobrada.
      </p>

      <Button
        className="h-12"
        disabled={!modality || isSubmitting}
        aria-busy={isSubmitting}
        onClick={onConfirm}
      >
        {isSubmitting ? <Spinner aria-hidden /> : <CalendarCheck aria-hidden />}
        Confirmar agendamento
      </Button>
    </section>
  );
}
