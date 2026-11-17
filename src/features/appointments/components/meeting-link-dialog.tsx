"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormDialog } from "@/components/dialog/form-dialog";
import { TextField } from "@/components/form/text-field";
import { useUpdateMeetingLinkMutation } from "../hooks/use-update-meeting-link-mutation";
import { type MeetingLinkInput, meetingLinkSchema } from "../schemas";
import type { Appointment } from "../types";

type MeetingLinkDialogProps = {
  appointment: Pick<Appointment, "id" | "meetingUrl"> | null;
  onOpenChange: (isOpen: boolean) => void;
};

export function MeetingLinkDialog({
  appointment,
  onOpenChange,
}: MeetingLinkDialogProps) {
  const updateMeetingLinkMutation = useUpdateMeetingLinkMutation();
  const form = useForm<MeetingLinkInput>({
    resolver: zodResolver(meetingLinkSchema),
    defaultValues: { meetingUrl: "" },
    values: appointment
      ? { meetingUrl: appointment.meetingUrl ?? "" }
      : undefined,
  });

  const handleSubmit = form.handleSubmit((input) => {
    if (!appointment) return;
    updateMeetingLinkMutation.mutate(
      { appointmentId: appointment.id, input },
      {
        onSuccess: () => {
          toast.success("Link da sala salvo.");
          onOpenChange(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  });

  return (
    <FormDialog
      isOpen={appointment !== null}
      onOpenChange={onOpenChange}
      title="Link desta sessão"
      description="Deixe em branco para usar a sala fixa definida em Configurações."
      submitLabel="Salvar"
      isSubmitting={updateMeetingLinkMutation.isPending}
      onSubmit={handleSubmit}
    >
      <TextField
        control={form.control}
        name="meetingUrl"
        label="Link da sala"
        type="url"
        placeholder="https://meet.google.com/..."
      />
    </FormDialog>
  );
}
