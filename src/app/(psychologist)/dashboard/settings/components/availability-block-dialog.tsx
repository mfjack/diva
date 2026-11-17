"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormDialog } from "@/components/dialog/form-dialog";
import { DateField } from "@/components/form/date-field";
import { TextField } from "@/components/form/text-field";
import { TimeField } from "@/components/form/time-field";
import { useCreateAvailabilityBlockMutation } from "@/features/practice-settings/hooks/use-create-availability-block-mutation";
import {
  type AvailabilityBlockInput,
  availabilityBlockSchema,
} from "@/features/practice-settings/schemas";
import type { AvailabilityBlock } from "@/features/practice-settings/types";
import { zonedDateTime } from "@/lib/dates";

const EMPTY_BLOCK_INPUT: AvailabilityBlockInput = {
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  reason: "",
};

type AvailabilityBlockDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCreated: (block: AvailabilityBlock) => void;
};

export function AvailabilityBlockDialog({
  isOpen,
  onOpenChange,
  onCreated,
}: AvailabilityBlockDialogProps) {
  const createBlockMutation = useCreateAvailabilityBlockMutation();
  const form = useForm<AvailabilityBlockInput>({
    resolver: zodResolver(availabilityBlockSchema),
    defaultValues: EMPTY_BLOCK_INPUT,
  });

  function handleOpenChange(nextIsOpen: boolean) {
    if (!nextIsOpen) form.reset(EMPTY_BLOCK_INPUT);
    onOpenChange(nextIsOpen);
  }

  const handleSubmit = form.handleSubmit((input) => {
    createBlockMutation.mutate(input, {
      onSuccess: ({ id }) => {
        onCreated({
          id,
          startsAt: zonedDateTime(
            input.startDate,
            input.startTime,
          ).toISOString(),
          endsAt: zonedDateTime(input.endDate, input.endTime).toISOString(),
          reason: input.reason || null,
        });
        toast.success("Bloqueio criado.");
        handleOpenChange(false);
      },
      onError: (error) => toast.error(error.message),
    });
  });

  return (
    <FormDialog
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      title="Novo bloqueio"
      description="Sessões já marcadas nesse período continuam na agenda."
      submitLabel="Bloquear"
      isSubmitting={createBlockMutation.isPending}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <DateField
            control={form.control}
            name="startDate"
            label="De"
            allowedDates="today-onwards"
          />
          <TimeField control={form.control} name="startTime" label="Horário" />
          <DateField
            control={form.control}
            name="endDate"
            label="Até"
            allowedDates="today-onwards"
          />
          <TimeField control={form.control} name="endTime" label="Horário" />
        </div>
        <TextField
          control={form.control}
          name="reason"
          label="Motivo"
          placeholder="Ex.: férias, congresso, supervisão"
          description="Só você vê o motivo."
        />
      </div>
    </FormDialog>
  );
}
