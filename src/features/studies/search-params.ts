import {
  createLoader,
  createSerializer,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import { STUDY_NOTE_KINDS } from "./types";

export const studyNotesSearchParams = {
  note: parseAsString,
  q: parseAsString.withDefault(""),
  kind: parseAsStringLiteral(STUDY_NOTE_KINDS),
  tag: parseAsString,
};

export const loadStudyNotesSearchParams = createLoader(studyNotesSearchParams);

export const serializeStudyNotesSearchParams = createSerializer(
  studyNotesSearchParams,
);
