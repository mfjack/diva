"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ChevronDown, FileDown, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AttachmentsPanel } from "@/components/attachments/attachments-panel";
import { RichTextField } from "@/components/form/rich-text-field";
import { TagsField } from "@/components/form/tags-field";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteStudyNoteAttachmentMutation } from "@/features/studies/hooks/use-delete-study-note-attachment-mutation";
import { useSaveStudyNoteMutation } from "@/features/studies/hooks/use-save-study-note-mutation";
import { useUploadStudyNoteAttachmentMutation } from "@/features/studies/hooks/use-upload-study-note-attachment-mutation";
import { UNTITLED_STUDY_NOTE } from "@/features/studies/labels";
import {
  STUDY_NOTE_MAX_TAGS,
  type StudyNoteInput,
  studyNoteSchema,
} from "@/features/studies/schemas";
import { toStudyNoteInput } from "@/features/studies/to-study-note-input";
import type {
  StudyNote,
  StudyNoteAttachmentId,
} from "@/features/studies/types";
import { useAutosave } from "@/hooks/use-autosave";
import { formatTime } from "@/lib/format";
import {
  buildStudyNoteAttachmentRoute,
  buildStudyNotePdfRoute,
} from "@/lib/routes";
import { cn } from "@/lib/utils";
import { StudyKindField } from "./study-kind-field";

type SaveStatusProps = {
  isSaving: boolean;
  hasError: boolean;
  savedAt: string;
};

function SaveStatus({ isSaving, hasError, savedAt }: SaveStatusProps) {
  return (
    <span
      role="status"
      className={cn(
        "text-sm",
        hasError ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {isSaving
        ? "Salvando…"
        : hasError
          ? "Não foi possível salvar"
          : `Salvo às ${formatTime(savedAt)}`}
    </span>
  );
}

type StudyNoteEditorProps = {
  note: StudyNote;
  kinds: readonly string[];
  tagSuggestions: readonly string[];
  listHref: string;
};

export function StudyNoteEditor({
  note,
  kinds,
  tagSuggestions,
  listHref,
}: StudyNoteEditorProps) {
  const uploadAttachmentMutation = useUploadStudyNoteAttachmentMutation();
  const deleteAttachmentMutation = useDeleteStudyNoteAttachmentMutation();
  const [savedAt, setSavedAt] = useState(note.updatedAt);
  const [isPreparingPdf, setIsPreparingPdf] = useState(false);
  const [isSourceOpen, setIsSourceOpen] = useState(note.source !== null);
  const saveMutation = useSaveStudyNoteMutation(note.id);
  const form = useForm<StudyNoteInput>({
    resolver: zodResolver(studyNoteSchema),
    defaultValues: toStudyNoteInput(note),
  });

  async function handleDownloadPdf() {
    setIsPreparingPdf(true);
    if (await form.trigger()) {
      await saveMutation
        .mutateAsync({ input: form.getValues() })
        .catch(() => undefined);
    }
    setIsPreparingPdf(false);
    window.location.assign(buildStudyNotePdfRoute(note.id));
  }

  function handleUploadAttachment(file: File) {
    uploadAttachmentMutation.mutate(
      { noteId: note.id, file },
      {
        onSuccess: () => toast.success("Documento anexado."),
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function handleRemoveAttachment(attachmentId: string) {
    deleteAttachmentMutation.mutate(
      {
        noteId: note.id,
        attachmentId: attachmentId as StudyNoteAttachmentId,
      },
      { onError: (error) => toast.error(error.message) },
    );
  }

  useAutosave(form, (input) =>
    saveMutation.mutate(
      { input },
      { onSuccess: ({ savedAt: nextSavedAt }) => setSavedAt(nextSavedAt) },
    ),
  );

  return (
    <article className="flex flex-col gap-5">
      <header className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Voltar para a lista"
          nativeButton={false}
          render={<Link href={listHref} />}
          className="lg:hidden"
        >
          <ArrowLeft aria-hidden />
        </Button>
        <SaveStatus
          isSaving={saveMutation.isPending}
          hasError={saveMutation.isError}
          savedAt={savedAt}
        />
        <Button
          variant="ghost"
          className="ml-auto"
          disabled={isPreparingPdf}
          aria-busy={isPreparingPdf}
          onClick={handleDownloadPdf}
        >
          {isPreparingPdf ? <Spinner aria-hidden /> : <FileDown aria-hidden />}
          Baixar PDF
        </Button>
      </header>

      <input
        {...form.register("title")}
        aria-label="Título"
        placeholder={UNTITLED_STUDY_NOTE}
        autoComplete="off"
        className="w-full bg-transparent font-heading font-semibold text-xl outline-none placeholder:text-muted-foreground"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StudyKindField form={form} kinds={kinds} />
        <TagsField
          control={form.control}
          name="tags"
          label="Temas"
          placeholder="Ex.: luto, TCC"
          suggestions={tagSuggestions}
          maxTags={STUDY_NOTE_MAX_TAGS}
        />
      </div>

      <section className="flex flex-col gap-4">
        <button
          type="button"
          aria-expanded={isSourceOpen}
          onClick={() => setIsSourceOpen((wasOpen) => !wasOpen)}
          className="flex w-fit items-center gap-1.5 font-medium text-sm"
        >
          Fonte
          <span className="font-normal text-muted-foreground">
            · livro, artigo ou curso
          </span>
          <ChevronDown
            aria-hidden
            className={cn(
              "size-4 transition-transform",
              isSourceOpen && "rotate-180",
            )}
          />
        </button>
        {isSourceOpen && (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              control={form.control}
              name="sourceTitle"
              label="Título da obra"
              placeholder="Ex.: Aconselhamento do luto"
            />
            <TextField
              control={form.control}
              name="sourceAuthor"
              label="Autor"
              placeholder="Ex.: J. William Worden"
            />
            <div className="sm:col-span-2">
              <TextField
                control={form.control}
                name="sourceUrl"
                type="url"
                label="Link"
                placeholder="https://"
              />
            </div>
          </div>
        )}
      </section>

      <RichTextField
        control={form.control}
        name="content"
        label="Anotação"
        isLabelHidden
        placeholder="Escreva suas ideias, resumos e reflexões…"
      />

      <AttachmentsPanel
        title="Documentos"
        attachments={note.attachments}
        getAttachmentHref={buildStudyNoteAttachmentRoute}
        isUploading={uploadAttachmentMutation.isPending}
        removingAttachmentId={
          deleteAttachmentMutation.isPending
            ? (deleteAttachmentMutation.variables?.attachmentId ?? null)
            : null
        }
        onUpload={handleUploadAttachment}
        onRemove={handleRemoveAttachment}
      />

      <p className="flex items-center gap-2 text-muted-foreground text-sm">
        <ShieldAlert aria-hidden className="size-4 shrink-0" />
        Evite dados que identifiquem pacientes. Para isso, use o prontuário.
      </p>
    </article>
  );
}
