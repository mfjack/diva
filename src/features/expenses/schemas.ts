import { z } from "zod";
import { EXPENSE_CATEGORIES, EXPENSE_RECURRENCES } from "./types";

const MIN_INSTALLMENTS = 2;
const MAX_INSTALLMENTS = 48;

export const expenseSchema = z
  .object({
    description: z
      .string()
      .trim()
      .min(1, "Descreva a despesa.")
      .max(120, "Descrição muito longa."),
    category: z.enum(EXPENSE_CATEGORIES, { error: "Escolha a categoria." }),
    amount: z
      .number({ error: "Informe o valor." })
      .positive("O valor precisa ser maior que zero."),
    recurrence: z.enum(EXPENSE_RECURRENCES, {
      error: "Escolha se a despesa se repete.",
    }),
    startsOn: z.iso.date({ error: "Informe a data." }),
    installmentCount: z
      .number()
      .int("Use um número inteiro.")
      .min(MIN_INSTALLMENTS, `O mínimo é ${MIN_INSTALLMENTS} parcelas.`)
      .max(MAX_INSTALLMENTS, `O máximo é ${MAX_INSTALLMENTS} parcelas.`)
      .optional(),
    notes: z.string().trim().max(500, "Texto muito longo."),
  })
  .refine(
    ({ recurrence, installmentCount }) =>
      recurrence !== "installments" || installmentCount !== undefined,
    { message: "Informe o número de parcelas.", path: ["installmentCount"] },
  );

export type ExpenseInput = z.infer<typeof expenseSchema>;

export const EMPTY_EXPENSE_INPUT: Partial<ExpenseInput> = {
  description: "",
  recurrence: "once",
  startsOn: "",
  notes: "",
};

export const expenseOccurrenceSchema = z.object({
  expenseId: z.string().min(1),
  dueOn: z.iso.date(),
});

export type ExpenseOccurrenceInput = z.infer<typeof expenseOccurrenceSchema>;
