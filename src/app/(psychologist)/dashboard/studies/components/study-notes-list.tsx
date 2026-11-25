import Link from "next/link";
import {
  getStudyNoteKindIcon,
  UNTITLED_STUDY_NOTE,
} from "@/features/studies/labels";
import type { StudyNoteSummary } from "@/features/studies/types";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { StudyNoteCardActions } from "./study-note-card-actions";

type StudyNotesListProps = {
  notes: readonly StudyNoteSummary[];
  selectedNoteId: string | null;
  getNoteHref: (noteId: string) => string;
  listHref: string;
};

export function StudyNotesList({
  notes,
  selectedNoteId,
  getNoteHref,
  listHref,
}: StudyNotesListProps) {
  if (notes.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground text-sm">
        Nenhuma anotação encontrada com esses filtros.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {notes.map((note) => {
        const Icon = getStudyNoteKindIcon(note.kind);
        const isSelected = note.id === selectedNoteId;
        return (
          <li
            key={note.id}
            className={cn(
              "flex items-start gap-1 rounded-xl border pr-1.5 transition-colors hover:bg-muted/60",
              isSelected && "border-primary/40 bg-primary/5 hover:bg-primary/8",
            )}
          >
            <Link
              href={getNoteHref(note.id)}
              aria-current={isSelected ? "page" : undefined}
              className="flex min-w-0 flex-1 flex-col gap-1 rounded-xl p-3 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <span className="flex items-center gap-2">
                <Icon
                  aria-label={note.kind}
                  className="size-4 shrink-0 text-primary"
                />
                <span className="min-w-0 flex-1 truncate font-medium text-sm">
                  {note.title || UNTITLED_STUDY_NOTE}
                </span>
              </span>
              {note.excerpt && (
                <span className="line-clamp-2 text-muted-foreground text-xs">
                  {note.excerpt}
                </span>
              )}
              <span className="flex flex-wrap items-center gap-1.5 text-muted-foreground text-xs">
                {formatShortDate(note.updatedAt)}
                {note.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-muted px-1.5 py-0.5 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </span>
            </Link>
            <div className="pt-1.5">
              <StudyNoteCardActions
                note={note}
                isSelected={isSelected}
                listHref={listHref}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
