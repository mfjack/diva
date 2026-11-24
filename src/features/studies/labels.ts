import {
  BookOpen,
  GraduationCap,
  Lightbulb,
  type LucideIcon,
  NotebookPen,
  Tag,
  UsersRound,
} from "lucide-react";

const DEFAULT_KIND_ICONS: Readonly<Record<string, LucideIcon>> = {
  Anotação: NotebookPen,
  Reflexão: Lightbulb,
  Leitura: BookOpen,
  Supervisão: UsersRound,
  "Curso/aula": GraduationCap,
};

export function getStudyNoteKindIcon(kind: string): LucideIcon {
  return DEFAULT_KIND_ICONS[kind] ?? Tag;
}

export function toStudyNoteKindOptions(kinds: readonly string[]) {
  return kinds.map((kind) => ({ value: kind, label: kind }));
}

export const UNTITLED_STUDY_NOTE = "Sem título";
