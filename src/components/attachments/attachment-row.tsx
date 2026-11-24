import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/attachments";

type AttachmentRowProps = {
  name: string;
  sizeBytes: number;
  href?: string;
  isRemoving?: boolean;
  onRemove: () => void;
};

export function AttachmentRow({
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
