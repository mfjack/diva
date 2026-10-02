"use client";

import { MapPin, Video } from "lucide-react";
import type { AvailableSlot } from "@/features/booking/available-slots";
import { groupSlotsByDayPeriod } from "@/features/booking/day-period";
import { zonedDateTime } from "@/lib/dates";
import { formatLongDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type SlotPickerProps = {
  dateKey: string | null;
  slots: AvailableSlot[];
  selectedSlot: AvailableSlot | null;
  onSelectSlot: (slot: AvailableSlot) => void;
};

function SlotModalityIcon({ slot }: { slot: AvailableSlot }) {
  if (slot.modality === "online") {
    return <Video aria-label="Só online" className="size-3.5" />;
  }
  if (slot.modality === "in_person") {
    return <MapPin aria-label="Só presencial" className="size-3.5" />;
  }
  return null;
}

export function SlotPicker({
  dateKey,
  slots,
  selectedSlot,
  onSelectSlot,
}: SlotPickerProps) {
  return (
    <section className="flex flex-col gap-4" aria-live="polite">
      <div className="flex flex-col gap-0.5">
        <h2 className="font-semibold">2. Escolha o horário</h2>
        {dateKey && (
          <p className="text-muted-foreground text-sm first-letter:uppercase">
            {formatLongDate(zonedDateTime(dateKey, "12:00"))}
          </p>
        )}
      </div>

      {slots.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-8 text-center text-muted-foreground text-sm">
          {dateKey
            ? "Nenhum horário livre nesse dia."
            : "Escolha um dia no calendário."}
        </p>
      ) : (
        groupSlotsByDayPeriod(slots).map((period) => (
          <div key={period.id} className="flex flex-col gap-2">
            <h3 className="text-muted-foreground text-xs uppercase tracking-wider">
              {period.label}
            </h3>
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-5">
              {period.slots.map((slot) => {
                const isSelected = selectedSlot?.startsAt === slot.startsAt;
                return (
                  <li key={slot.startsAt}>
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => onSelectSlot(slot)}
                      className={cn(
                        "flex h-12 w-full items-center justify-center gap-1.5 rounded-lg border font-medium tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-card hover:border-primary",
                      )}
                    >
                      {formatTime(slot.startsAt)}
                      <SlotModalityIcon slot={slot} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}
