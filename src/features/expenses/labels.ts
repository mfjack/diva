import type { ExpenseCategory, ExpenseRecurrence } from "./types";

export const EXPENSE_CATEGORY_LABELS = {
  supervision: "Supervisão",
  education: "Cursos e estudos",
  materials: "Materiais e testes",
  office: "Aluguel e sala",
  software: "Software e assinaturas",
  taxes: "Impostos e CRP",
  other: "Outros",
} as const satisfies Record<ExpenseCategory, string>;

export const EXPENSE_CATEGORY_OPTIONS = Object.entries(
  EXPENSE_CATEGORY_LABELS,
).map(([value, label]) => ({ value, label }));

export const EXPENSE_RECURRENCE_LABELS = {
  once: "Única",
  weekly: "Semanal",
  monthly: "Mensal",
  installments: "Parcelada",
} as const satisfies Record<ExpenseRecurrence, string>;

export const EXPENSE_RECURRENCE_OPTIONS = Object.entries(
  EXPENSE_RECURRENCE_LABELS,
).map(([value, label]) => ({ value, label }));
