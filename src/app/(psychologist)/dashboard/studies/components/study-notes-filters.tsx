"use client";

import { debounce, useQueryStates } from "nuqs";
import { FilterSelect } from "@/components/filter-select";
import { SearchInput } from "@/components/search-input";
import { STUDY_NOTE_KIND_OPTIONS } from "@/features/studies/labels";
import { studyNotesSearchParams } from "@/features/studies/search-params";
import { STUDY_NOTE_KINDS, type StudyNoteKind } from "@/features/studies/types";

const SEARCH_DEBOUNCE_MS = 300;

function isStudyNoteKind(value: string | null): value is StudyNoteKind {
  return STUDY_NOTE_KINDS.some((kind) => kind === value);
}

type StudyNotesFiltersProps = {
  tags: readonly string[];
};

export function StudyNotesFilters({ tags }: StudyNotesFiltersProps) {
  const [{ q, kind, tag }, setFilters] = useQueryStates(
    studyNotesSearchParams,
    { shallow: false },
  );
  const tagOptions = tags.map((currentTag) => ({
    value: currentTag,
    label: currentTag,
  }));

  function handleSearchChange(value: string) {
    setFilters(
      { q: value || null },
      { limitUrlUpdates: value ? debounce(SEARCH_DEBOUNCE_MS) : undefined },
    );
  }

  function handleKindChange(value: string | null) {
    setFilters({ kind: isStudyNoteKind(value) ? value : null });
  }

  function handleTagChange(value: string | null) {
    setFilters({ tag: value });
  }

  return (
    <div className="flex flex-col gap-2">
      <SearchInput
        placeholder="Buscar nas anotações"
        value={q}
        onChange={handleSearchChange}
      />
      <div className="grid grid-cols-2 gap-2">
        <FilterSelect
          label="Filtrar por tipo"
          allLabel="Todos os tipos"
          value={kind}
          options={STUDY_NOTE_KIND_OPTIONS}
          onChange={handleKindChange}
        />
        <FilterSelect
          label="Filtrar por tema"
          allLabel="Todos os temas"
          value={tag}
          options={tagOptions}
          onChange={handleTagChange}
        />
      </div>
    </div>
  );
}
