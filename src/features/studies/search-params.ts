import { createLoader, createSerializer, parseAsString } from "nuqs/server";

export const studyNotesSearchParams = {
  note: parseAsString,
  q: parseAsString.withDefault(""),
  kind: parseAsString,
  tag: parseAsString,
};

export const loadStudyNotesSearchParams = createLoader(studyNotesSearchParams);

export const serializeStudyNotesSearchParams = createSerializer(
  studyNotesSearchParams,
);
