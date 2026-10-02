"use client";

import { format } from "date-fns";
import { useMemo, useState } from "react";
import { ptBR } from "react-day-picker/locale";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import type { AppointmentModality } from "@/features/appointments/types";
import {
  type AvailableSlot,
  getAvailableSlots,
  getBookableDateKeys,
  type SlotAvailabilityInput,
  type TimePeriod,
} from "@/features/booking/available-slots";
import { useBookAppointmentMutation } from "@/features/booking/hooks/use-book-appointment-mutation";
import type {
  AvailabilityBlock,
  AvailabilityRule,
} from "@/features/practice-settings/types";
import type { Cents } from "@/lib/money";
import { BookingConfirmation } from "./booking-confirmation";
import { BookingSummary } from "./booking-summary";
import { SlotPicker } from "./slot-picker";

const CALENDAR_DATE_KEY_FORMAT = "yyyy-MM-dd";

type BookingViewProps = {
  rules: AvailabilityRule[];
  blocks: AvailabilityBlock[];
  busyPeriods: TimePeriod[];
  sessionDurationMinutes: number;
  minimumBookingNoticeHours: number;
  bookingWindowDays: number;
  cancellationNoticeHours: number;
  priceCents: Cents;
  officeAddress: string | null;
};

type BookingState =
  | { step: "selecting" }
  | { step: "booked"; slot: AvailableSlot; modality: AppointmentModality };

function calendarDateToKey(date: Date): string {
  return format(date, CALENDAR_DATE_KEY_FORMAT);
}

function dateKeyToCalendarDate(dateKey: string): Date {
  const [year = 0, month = 1, day = 1] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function BookingView({
  rules,
  blocks,
  busyPeriods,
  sessionDurationMinutes,
  minimumBookingNoticeHours,
  bookingWindowDays,
  cancellationNoticeHours,
  priceCents,
  officeAddress,
}: BookingViewProps) {
  const [now] = useState(() => new Date());
  const [bookingState, setBookingState] = useState<BookingState>({
    step: "selecting",
  });
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [chosenModality, setChosenModality] =
    useState<AppointmentModality | null>(null);
  const bookAppointmentMutation = useBookAppointmentMutation();

  const availabilityInput = useMemo<SlotAvailabilityInput>(
    () => ({
      rules,
      blocks,
      busyPeriods,
      sessionDurationMinutes,
      minimumBookingNoticeHours,
      now,
    }),
    [
      rules,
      blocks,
      busyPeriods,
      sessionDurationMinutes,
      minimumBookingNoticeHours,
      now,
    ],
  );

  const bookableDateKeys = useMemo(
    () => getBookableDateKeys(bookingWindowDays, availabilityInput),
    [bookingWindowDays, availabilityInput],
  );
  const bookableDateKeySet = useMemo(
    () => new Set(bookableDateKeys),
    [bookableDateKeys],
  );

  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(
    () => bookableDateKeys[0] ?? null,
  );

  const slots = useMemo(
    () =>
      selectedDateKey
        ? getAvailableSlots(selectedDateKey, availabilityInput)
        : [],
    [selectedDateKey, availabilityInput],
  );

  const modality = selectedSlot?.modality ?? chosenModality;

  function handleSelectDate(date: Date | undefined) {
    setSelectedDateKey(date ? calendarDateToKey(date) : null);
    setSelectedSlot(null);
    setChosenModality(null);
  }

  function handleSelectSlot(slot: AvailableSlot) {
    setSelectedSlot(slot);
    setChosenModality(null);
  }

  function handleConfirm() {
    if (!selectedSlot || !modality) return;
    bookAppointmentMutation.mutate(
      { startsAt: selectedSlot.startsAt, modality },
      {
        onSuccess: () =>
          setBookingState({ step: "booked", slot: selectedSlot, modality }),
        onError: (error) => toast.error(error.message),
      },
    );
  }

  if (bookingState.step === "booked") {
    return (
      <BookingConfirmation
        slot={bookingState.slot}
        modality={bookingState.modality}
        officeAddress={officeAddress}
      />
    );
  }

  const lastBookableDateKey = bookableDateKeys.at(-1);

  return (
    <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:gap-10">
      <div className="flex flex-col gap-3">
        <h2 className="font-semibold">1. Escolha o dia</h2>
        <Calendar
          mode="single"
          locale={ptBR}
          selected={
            selectedDateKey ? dateKeyToCalendarDate(selectedDateKey) : undefined
          }
          onSelect={handleSelectDate}
          disabled={(date) => !bookableDateKeySet.has(calendarDateToKey(date))}
          startMonth={now}
          endMonth={
            lastBookableDateKey
              ? dateKeyToCalendarDate(lastBookableDateKey)
              : now
          }
          showOutsideDays={false}
          className="w-full rounded-xl border p-3 [--cell-size:--spacing(10)] sm:w-fit"
        />
      </div>

      <div className="flex flex-col gap-8">
        <SlotPicker
          dateKey={selectedDateKey}
          slots={slots}
          selectedSlot={selectedSlot}
          onSelectSlot={handleSelectSlot}
        />
        {selectedSlot && (
          <BookingSummary
            slot={selectedSlot}
            modality={modality}
            onChooseModality={setChosenModality}
            priceCents={priceCents}
            cancellationNoticeHours={cancellationNoticeHours}
            isSubmitting={bookAppointmentMutation.isPending}
            onConfirm={handleConfirm}
          />
        )}
      </div>
    </div>
  );
}
