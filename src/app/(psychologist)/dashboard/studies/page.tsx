import { NotebookPen } from "lucide-react";
import type { Metadata } from "next";
import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  getStudyNote,
  hasStudyNotes,
  listStudyNotes,
  listStudyTags,
} from "@/features/studies/queries";
import {
  loadStudyNotesSearchParams,
  serializeStudyNotesSearchParams,
} from "@/features/studies/search-params";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { NewStudyNoteButton } from "./components/new-study-note-button";
import { StudyNoteEditor } from "./components/study-note-editor";
import { StudyNotesFilters } from "./components/study-notes-filters";
import { StudyNotesList } from "./components/study-notes-list";

export const metadata: Metadata = {
  title: "Estudos",
};

export default async function StudiesPage({
  searchParams,
}: PageProps<"/dashboard/studies">) {
  const {
    note: noteId,
    q,
    kind,
    tag,
  } = await loadStudyNotesSearchParams(searchParams);
  const filters = { search: q, kind, tag };

  const [notes, tags, selectedNote, hasNotes] = await Promise.all([
    listStudyNotes(filters),
    listStudyTags(),
    noteId ? getStudyNote(noteId) : null,
    hasStudyNotes(),
  ]);

  const listHref = serializeStudyNotesSearchParams(
    ROUTES.psychologist.studies,
    { ...filters, q: filters.search || null, note: null },
  );
  function getNoteHref(selectedId: string): string {
    return serializeStudyNotesSearchParams(ROUTES.psychologist.studies, {
      q: q || null,
      kind,
      tag,
      note: selectedId,
    });
  }

  const header = (
    <PageHeader
      title="Estudos"
      description="Anotações, leituras, supervisões e reflexões"
      actions={<NewStudyNoteButton />}
    />
  );

  if (!hasNotes) {
    return (
      <>
        {header}
        <PageContent>
          <Empty className="flex-1 border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <NotebookPen aria-hidden />
              </EmptyMedia>
              <EmptyTitle>Seu espaço de estudos</EmptyTitle>
              <EmptyDescription>
                Registre leituras, supervisões, cursos e reflexões. Tudo fica só
                com você e salva sozinho enquanto escreve.
              </EmptyDescription>
            </EmptyHeader>
            <NewStudyNoteButton />
          </Empty>
        </PageContent>
      </>
    );
  }

  return (
    <>
      {header}
      <PageContent className="lg:grid lg:grid-cols-[22rem_1fr] lg:items-start">
        <aside
          aria-label="Anotações"
          className={cn(
            "flex flex-col gap-4",
            selectedNote && "hidden lg:flex",
          )}
        >
          <StudyNotesFilters tags={tags} />
          <StudyNotesList
            notes={notes}
            selectedNoteId={selectedNote?.id ?? null}
            getNoteHref={getNoteHref}
            listHref={listHref}
          />
        </aside>

        <section
          aria-label="Anotação aberta"
          className={cn("min-w-0", !selectedNote && "hidden lg:block")}
        >
          {selectedNote ? (
            <StudyNoteEditor
              key={selectedNote.id}
              note={selectedNote}
              tagSuggestions={tags}
              listHref={listHref}
            />
          ) : (
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <NotebookPen aria-hidden />
                </EmptyMedia>
                <EmptyTitle>Nenhuma anotação aberta</EmptyTitle>
                <EmptyDescription>
                  Escolha uma anotação na lista para ler ou continuar
                  escrevendo.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </section>
      </PageContent>
    </>
  );
}
