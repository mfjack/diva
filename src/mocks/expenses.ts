import "server-only";

import type {
  Expense,
  ExpenseAttachment,
  ExpensePayment,
} from "@/features/expenses/types";
import { getMockDatabase, saveMockDatabase } from "./store";

function withOptionalFields(expenses: Expense[]): Expense[] {
  for (const expense of expenses) {
    expense.installmentCount ??= null;
    expense.notes ??= null;
    expense.attachments ??= [];
  }
  return expenses;
}

export function listMockExpenses(): Expense[] {
  return withOptionalFields(getMockDatabase().expenses);
}

export function findMockExpenseAttachment(
  attachmentId: string,
): { expense: Expense; attachment: ExpenseAttachment } | undefined {
  for (const expense of listMockExpenses()) {
    const attachment = expense.attachments.find(
      ({ id }) => id === attachmentId,
    );
    if (attachment) return { expense, attachment };
  }
  return undefined;
}

export function findMockExpense(expenseId: string): Expense | undefined {
  return listMockExpenses().find(({ id }) => id === expenseId);
}

export function insertMockExpense(expense: Expense): void {
  getMockDatabase().expenses.push(expense);
  saveMockDatabase();
}

export function updateMockExpense(
  expenseId: string,
  changes: Partial<Omit<Expense, "id">>,
): void {
  const expense = findMockExpense(expenseId);
  if (!expense) return;
  Object.assign(expense, changes);
  saveMockDatabase();
}

export function deleteMockExpense(expenseId: string): void {
  const database = getMockDatabase();
  database.expenses = database.expenses.filter(({ id }) => id !== expenseId);
  database.expensePayments = database.expensePayments.filter(
    (payment) => payment.expenseId !== expenseId,
  );
  saveMockDatabase();
}

export function listMockExpensePayments(): ExpensePayment[] {
  return getMockDatabase().expensePayments;
}

export function findMockExpensePayment(
  expenseId: string,
  dueOn: string,
): ExpensePayment | undefined {
  return listMockExpensePayments().find(
    (payment) => payment.expenseId === expenseId && payment.dueOn === dueOn,
  );
}

export function insertMockExpensePayment(payment: ExpensePayment): void {
  getMockDatabase().expensePayments.push(payment);
  saveMockDatabase();
}

export function deleteMockExpensePayments(
  shouldDelete: (payment: ExpensePayment) => boolean,
): void {
  const database = getMockDatabase();
  database.expensePayments = database.expensePayments.filter(
    (payment) => !shouldDelete(payment),
  );
  saveMockDatabase();
}
