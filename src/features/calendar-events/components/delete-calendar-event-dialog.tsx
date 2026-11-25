"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormDialog } from "@/components/dialog/form-dialog";
import { RadioGroupField } from "@/components/form/radio-group-field";
import { formatDate, formatTime } from "@/lib/format";
import { useDeleteCalendarEventMutation } from "../hooks/use-delete-calendar-event-mutation";
import {
  type DeleteCalendarEventInput,
  deleteCalendarEventSchema,
} from "../schemas";
import type { CalendarEvent } from "../types";

const DELETE_SCOPE_OPTIONS = [
  { value: "single", label: "Só este evento" },
  {
    value: "following",
    label: "Este e os próximos",
    description: "Os eventos anteriores da série continuam na agenda.",
  },
] as const;

type DeleteCalendarEventDialogProps = {
  event: CalendarEvent | null;
  onOpenChange: (isOpen: boolean) => void;
};

export function DeleteCalendarEventDialog({
  event,
  onOpenChange,
}: DeleteCalendarEventDialogProps) {
  const deleteEventMutation = useDeleteCalendarEventMutation();
  const form = useForm<DeleteCalendarEventInput>({
    resolver: zodResolver(deleteCalendarEventSchema),
    defaultValues: { scope: "single" },
  });

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) form.reset();
    onOpenChange(isOpen);
  }

  const handleSubmit = form.handleSubmit((input) => {
    if (!event) return;
    deleteEventMutation.mutate(
      { eventId: event.id, input },
      {
        onSuccess: () => {
          toast.success("Evento excluído.");
          handleOpenChange(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  });

  return (
    <FormDialog
      isOpen={event !== null}
      onOpenChange={handleOpenChange}
      title="Excluir evento"
      description={
        event
          ? `${event.title} · ${formatDate(event.startsAt)} às ${formatTime(event.startsAt)}`
          : undefined
      }
      submitLabel="Excluir"
      isSubmitting={deleteEventMutation.isPending}
      onSubmit={handleSubmit}
    >
      {event?.seriesId ? (
        <RadioGroupField
          control={form.control}
          name="scope"
          label="Esse evento se repete. O que excluir?"
          options={DELETE_SCOPE_OPTIONS}
        />
      ) : (
        <p className="text-muted-foreground text-sm">
          O horário fica livre de novo na agenda.
        </p>
      )}
    </FormDialog>
  );
}
