import {
  BookOpen,
  GraduationCap,
  Lightbulb,
  type LucideIcon,
  NotebookPen,
  UsersRound,
} from "lucide-react";
import type { StudyNoteKind } from "./types";

export const STUDY_NOTE_KIND_LABELS = {
  note: "Anotação",
  reflection: "Reflexão",
  reading: "Leitura",
  supervision: "Supervisão",
  course: "Curso/aula",
} as const satisfies Record<StudyNoteKind, string>;

export const STUDY_NOTE_KIND_ICONS = {
  note: NotebookPen,
  reflection: Lightbulb,
  reading: BookOpen,
  supervision: UsersRound,
  course: GraduationCap,
} as const satisfies Record<StudyNoteKind, LucideIcon>;

export const STUDY_NOTE_KIND_OPTIONS = Object.entries(
  STUDY_NOTE_KIND_LABELS,
).map(([value, label]) => ({ value, label }));

export const UNTITLED_STUDY_NOTE = "Sem título";
