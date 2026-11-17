"use client";

import { Pin, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  ConfirmDialog,
  IRREVERSIBLE_ACTION_MESSAGE,
} from "@/components/dialog/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteStudyNoteMutation } from "@/features/studies/hooks/use-delete-study-note-mutation";
import { useToggleStudyNotePinMutation } from "@/features/studies/hooks/use-toggle-study-note-pin-mutation";
import { UNTITLED_STUDY_NOTE } from "@/features/studies/labels";
import type { StudyNoteSummary } from "@/features/studies/types";
import { cn } from "@/lib/utils";

type StudyNoteCardActionsProps = {
  note: Pick<StudyNoteSummary, "id" | "title" | "isPinned">;
  isSelected: boolean;
  listHref: string;
};

export function StudyNoteCardActions({
  note,
  isSelected,
  listHref,
}: StudyNoteCardActionsProps) {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const togglePinMutation = useToggleStudyNotePinMutation();
  const deleteMutation = useDeleteStudyNoteMutation();
  const title = note.title || UNTITLED_STUDY_NOTE;

  function handleTogglePin() {
    togglePinMutation.mutate(note.id, {
      onError: (error) => toast.error(error.message),
    });
  }

  function handleDelete() {
    deleteMutation.mutate(note.id, {
      onSuccess: () => {
        toast.success("Anotação excluída.");
        setIsDeleteOpen(false);
        if (isSelected) router.push(listHref);
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <div className="flex shrink-0 items-center">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={note.isPinned ? `Desafixar ${title}` : `Fixar ${title}`}
        aria-pressed={note.isPinned}
        title={note.isPinned ? "Desafixar" : "Fixar no topo"}
        disabled={togglePinMutation.isPending}
        onClick={handleTogglePin}
        className={cn(note.isPinned ? "text-primary" : "text-muted-foreground")}
      >
        <Pin aria-hidden className={cn(note.isPinned && "fill-current")} />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Excluir ${title}`}
        title="Excluir"
        onClick={() => setIsDeleteOpen(true)}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 aria-hidden />
      </Button>
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Excluir anotação"
        description={`${title}. ${IRREVERSIBLE_ACTION_MESSAGE}`}
        confirmLabel="Excluir"
        isConfirming={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
