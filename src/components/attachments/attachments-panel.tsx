"use client";

import { Paperclip } from "lucide-react";
import { type ChangeEvent, useId, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  ATTACHMENT_ACCEPT,
  type Attachment,
  getAttachmentSizeError,
  MAX_ATTACHMENTS_PER_ITEM,
} from "@/lib/attachments";
import { AttachmentRow } from "./attachment-row";

type AttachmentsPanelProps = {
  title: string;
  attachments: readonly Attachment[];
  getAttachmentHref: (attachmentId: string) => string;
  isUploading: boolean;
  removingAttachmentId: string | null;
  onUpload: (file: File) => void;
  onRemove: (attachmentId: string) => void;
};

export function AttachmentsPanel({
  title,
  attachments,
  getAttachmentHref,
  isUploading,
  removingAttachmentId,
  onUpload,
  onRemove,
}: AttachmentsPanelProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const canAddMore = attachments.length < MAX_ATTACHMENTS_PER_ITEM;

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const sizeError = getAttachmentSizeError(file.size);
    if (sizeError) {
      toast.error(`${file.name}: ${sizeError}`);
      return;
    }
    onUpload(file);
  }

  function handleChooseFile() {
    inputRef.current?.click();
  }

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="font-medium text-sm">
          {title}
        </label>
        <span className="text-muted-foreground text-xs">
          PDF ou imagem, até 5 MB
        </span>
      </div>
      {attachments.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {attachments.map((attachment) => (
            <AttachmentRow
              key={attachment.id}
              name={attachment.fileName}
              sizeBytes={attachment.sizeBytes}
              href={getAttachmentHref(attachment.id)}
              isRemoving={removingAttachmentId === attachment.id}
              onRemove={() => onRemove(attachment.id)}
            />
          ))}
        </ul>
      )}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ATTACHMENT_ACCEPT}
        className="sr-only"
        onChange={handleFileSelected}
      />
      {canAddMore && (
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          disabled={isUploading}
          aria-busy={isUploading}
          onClick={handleChooseFile}
        >
          {isUploading ? <Spinner aria-hidden /> : <Paperclip aria-hidden />}
          Anexar arquivo
        </Button>
      )}
    </section>
  );
}
