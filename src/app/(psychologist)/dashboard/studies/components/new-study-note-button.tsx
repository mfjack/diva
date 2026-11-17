"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCreateStudyNoteMutation } from "@/features/studies/hooks/use-create-study-note-mutation";
import { serializeStudyNotesSearchParams } from "@/features/studies/search-params";
import { ROUTES } from "@/lib/routes";

export function NewStudyNoteButton() {
  const router = useRouter();
  const createNoteMutation = useCreateStudyNoteMutation();

  function handleCreate() {
    createNoteMutation.mutate(undefined, {
      onSuccess: ({ noteId }) =>
        router.push(
          serializeStudyNotesSearchParams(ROUTES.psychologist.studies, {
            note: noteId,
          }),
        ),
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <Button
      onClick={handleCreate}
      disabled={createNoteMutation.isPending}
      aria-busy={createNoteMutation.isPending}
    >
      {createNoteMutation.isPending ? (
        <Spinner aria-hidden />
      ) : (
        <Plus aria-hidden />
      )}
      Nova anotação
    </Button>
  );
}
