"use client";

import { FileText, Paperclip, X } from "lucide-react";
import { type ChangeEvent, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buildExpenseAttachmentRoute } from "@/lib/routes";
import {
  ATTACHMENT_ACCEPT,
  formatFileSize,
  getAttachmentSizeError,
  MAX_ATTACHMENTS_PER_EXPENSE,
} from "../attachments";
import { useDeleteExpenseAttachmentMutation } from "../hooks/use-delete-expense-attachment-mutation";
import type { ExpenseAttachment, ExpenseId } from "../types";

type AttachmentRowProps = {
  name: string;
  sizeBytes: number;
  href?: string;
  isRemoving?: boolean;
  onRemove: () => void;
};

function AttachmentRow({
  name,
  sizeBytes,
  href,
  isRemoving = false,
  onRemove,
}: AttachmentRowProps) {
  return (
    <li className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
      <FileText aria-hidden className="size-4 shrink-0 text-primary" />
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 flex-1 truncate underline-offset-4 hover:underline"
        >
          {name}
        </a>
      ) : (
        <span className="min-w-0 flex-1 truncate">{name}</span>
      )}
      <span className="shrink-0 text-muted-foreground text-xs">
        {formatFileSize(sizeBytes)}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Remover ${name}`}
        disabled={isRemoving}
        onClick={onRemove}
      >
        <X aria-hidden />
      </Button>
    </li>
  );
}

type ExpenseAttachmentsInputProps = {
  expenseId: ExpenseId | null;
  attachments: readonly ExpenseAttachment[];
  pendingFiles: readonly File[];
  onPendingFilesChange: (files: File[]) => void;
};

export function ExpenseAttachmentsInput({
  expenseId,
  attachments,
  pendingFiles,
  onPendingFilesChange,
}: ExpenseAttachmentsInputProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [removedIds, setRemovedIds] = useState<readonly string[]>([]);
  const deleteAttachmentMutation = useDeleteExpenseAttachmentMutation();
  const savedAttachments = attachments.filter(
    ({ id }) => !removedIds.includes(id),
  );
  const totalCount = savedAttachments.length + pendingFiles.length;
  const canAddMore = totalCount < MAX_ATTACHMENTS_PER_EXPENSE;

  function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    const acceptedFiles = selectedFiles.filter((file) => {
      const sizeError = getAttachmentSizeError(file.size);
      if (sizeError) toast.error(`${file.name}: ${sizeError}`);
      return sizeError === null;
    });
    const availableSlots = MAX_ATTACHMENTS_PER_EXPENSE - totalCount;
    if (acceptedFiles.length > availableSlots) {
      toast.error(
        `Cada despesa aceita até ${MAX_ATTACHMENTS_PER_EXPENSE} anexos.`,
      );
    }
    onPendingFilesChange([
      ...pendingFiles,
      ...acceptedFiles.slice(0, availableSlots),
    ]);
  }

  function handleRemovePending(fileToRemove: File) {
    onPendingFilesChange(pendingFiles.filter((file) => file !== fileToRemove));
  }

  function handleRemoveSaved(attachment: ExpenseAttachment) {
    if (!expenseId) return;
    deleteAttachmentMutation.mutate(
      { expenseId, attachmentId: attachment.id },
      {
        onSuccess: () =>
          setRemovedIds((currentIds) => [...currentIds, attachment.id]),
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="font-medium text-sm">
          Anexos
        </label>
        <span className="text-muted-foreground text-xs">
          PDF ou imagem, até 5 MB
        </span>
      </div>
      {totalCount > 0 && (
        <ul className="flex flex-col gap-1.5">
          {savedAttachments.map((attachment) => (
            <AttachmentRow
              key={attachment.id}
              name={attachment.fileName}
              sizeBytes={attachment.sizeBytes}
              href={buildExpenseAttachmentRoute(attachment.id)}
              isRemoving={
                deleteAttachmentMutation.isPending &&
                deleteAttachmentMutation.variables?.attachmentId ===
                  attachment.id
              }
              onRemove={() => handleRemoveSaved(attachment)}
            />
          ))}
          {pendingFiles.map((file) => (
            <AttachmentRow
              key={`${file.name}-${file.lastModified}-${file.size}`}
              name={file.name}
              sizeBytes={file.size}
              onRemove={() => handleRemovePending(file)}
            />
          ))}
        </ul>
      )}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ATTACHMENT_ACCEPT}
        multiple
        className="sr-only"
        onChange={handleFilesSelected}
      />
      {canAddMore && (
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip aria-hidden />
          Anexar arquivo
        </Button>
      )}
    </section>
  );
}
