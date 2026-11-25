"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FormDialog } from "@/components/dialog/form-dialog";
import { DateField } from "@/components/form/date-field";
import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { TextareaField } from "@/components/form/textarea-field";
import { TimeField } from "@/components/form/time-field";
import { buildTimeSlots, DEFAULT_TIME_SLOT_OPTIONS } from "@/lib/time-slots";
import { useSaveCalendarEventMutation } from "../hooks/use-save-calendar-event-mutation";
import { EVENT_REPEAT_OPTIONS } from "../labels";
import { type CalendarEventInput, calendarEventSchema } from "../schemas";
import {
  EMPTY_CALENDAR_EVENT_INPUT,
  toCalendarEventInput,
} from "../to-calendar-event-input";
import type { CalendarEvent } from "../types";

const HALF_HOUR_IN_MINUTES = 30;

const EVENT_TIME_SLOTS = buildTimeSlots({
  ...DEFAULT_TIME_SLOT_OPTIONS,
  stepMinutes: HALF_HOUR_IN_MINUTES,
});

type CalendarEventDialogProps = {
  isOpen: boolean;
  event: CalendarEvent | null;
  onOpenChange: (isOpen: boolean) => void;
  onDeleteRequest?: (event: CalendarEvent) => void;
};

export function CalendarEventDialog({
  isOpen,
  event,
  onOpenChange,
  onDeleteRequest,
}: CalendarEventDialogProps) {
  const saveEventMutation = useSaveCalendarEventMutation();
  const form = useForm<CalendarEventInput>({
    resolver: zodResolver(calendarEventSchema),
    defaultValues: event
      ? toCalendarEventInput(event)
      : EMPTY_CALENDAR_EVENT_INPUT,
  });
  const repeat = useWatch({ control: form.control, name: "repeat" });
  const isRepeating = !event && repeat !== "none";

  function handleOpenChange(nextIsOpen: boolean) {
    if (!nextIsOpen) form.reset();
    onOpenChange(nextIsOpen);
  }

  function handleSaved({ createdCount }: { createdCount: number }) {
    toast.success(
      createdCount > 1
        ? `${createdCount} eventos adicionados à agenda.`
        : event
          ? "Evento atualizado."
          : "Evento adicionado à agenda.",
    );
    handleOpenChange(false);
  }

  const handleSubmit = form.handleSubmit((input) => {
    saveEventMutation.mutate(
      { eventId: event?.id ?? null, input },
      {
        onSuccess: handleSaved,
        onError: (error) => toast.error(error.message),
      },
    );
  });

  return (
    <FormDialog
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      title={event ? "Editar evento" : "Novo evento"}
      description="Supervisão, curso, pós-graduação ou um compromisso seu. O horário fica ocupado na agenda."
      submitLabel={event ? "Salvar" : "Adicionar"}
      isSubmitting={saveEventMutation.isPending}
      onSubmit={handleSubmit}
      secondaryAction={
        event && onDeleteRequest
          ? {
              label: "Excluir",
              isPending: false,
              onClick: () => onDeleteRequest(event),
            }
          : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <TextField
          control={form.control}
          name="title"
          label="Nome"
          placeholder="Ex.: Supervisão clínica"
        />
        <DateField
          control={form.control}
          name="date"
          label={isRepeating ? "Primeira data" : "Data"}
        />
        <div className="grid grid-cols-2 gap-4">
          <TimeField
            control={form.control}
            name="startTime"
            label="Início"
            times={EVENT_TIME_SLOTS}
          />
          <TimeField
            control={form.control}
            name="endTime"
            label="Fim"
            times={EVENT_TIME_SLOTS}
          />
        </div>
        {!event && (
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              control={form.control}
              name="repeat"
              label="Repetir"
              options={EVENT_REPEAT_OPTIONS}
            />
            {isRepeating && (
              <DateField
                control={form.control}
                name="repeatUntil"
                label="Até"
                allowedDates="today-onwards"
              />
            )}
          </div>
        )}
        <TextareaField
          control={form.control}
          name="notes"
          label="Observações"
          placeholder="Local, link, material…"
        />
      </div>
    </FormDialog>
  );
}
