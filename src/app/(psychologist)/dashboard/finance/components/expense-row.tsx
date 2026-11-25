"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarX2,
  Ellipsis,
  FileText,
  MessageSquareText,
  Paperclip,
  Pencil,
  Trash2,
  Undo2,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_RECURRENCE_LABELS,
} from "@/features/expenses/labels";
import { canEndRecurrence } from "@/features/expenses/recurrence";
import type { ExpenseOccurrence } from "@/features/expenses/types";
import { dateKeyToLocalDate, formatDateKey } from "@/lib/dates";
import { formatCurrency } from "@/lib/format";
import { buildExpenseAttachmentRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";

export type ExpenseRowAction = "edit" | "end" | "delete";

type ExpenseRowProps = {
  occurrence: ExpenseOccurrence;
  todayKey: string;
  isUpdatingPayment: boolean;
  onPay: (occurrence: ExpenseOccurrence) => void;
  onCancelPayment: (occurrence: ExpenseOccurrence) => void;
  onAction: (occurrence: ExpenseOccurrence, action: ExpenseRowAction) => void;
};

function getRecurrenceDetail({
  expense,
  installmentNumber,
}: ExpenseOccurrence): string | null {
  if (installmentNumber !== null) {
    return `Parcela ${installmentNumber}/${expense.installmentCount}`;
  }
  return expense.recurrence === "once"
    ? null
    : EXPENSE_RECURRENCE_LABELS[expense.recurrence];
}

function getDetails(occurrence: ExpenseOccurrence): string {
  const { expense, paidOn } = occurrence;
  const recurrenceDetail = getRecurrenceDetail(occurrence);
  const details: string[] = [EXPENSE_CATEGORY_LABELS[expense.category]];
  if (recurrenceDetail) details.push(recurrenceDetail);
  if (paidOn !== null) details.push(`Paga em ${formatDateKey(paidOn)}`);
  return details.join(" · ");
}

export function ExpenseRow({
  occurrence,
  todayKey,
  isUpdatingPayment,
  onPay,
  onCancelPayment,
  onAction,
}: ExpenseRowProps) {
  const { expense, dueOn, status } = occurrence;
  const dueDate = dateKeyToLocalDate(dueOn);
  const isOverdue = status === "overdue";
  const isPaid = status === "paid";

  return (
    <li className="flex items-center gap-4 rounded-xl border bg-card p-3 text-sm">
      <div
        className={cn(
          "flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-muted leading-tight",
          isOverdue && "bg-destructive/10 text-destructive",
        )}
      >
        <span className="font-semibold text-sm tabular-nums">
          {format(dueDate, "d")}
        </span>
        <span className="text-sm">
          {format(dueDate, "MMM", { locale: ptBR })}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            "truncate font-medium",
            isPaid && "text-muted-foreground",
          )}
        >
          {expense.description}
        </span>
        <span className="truncate text-muted-foreground text-sm">
          {getDetails(occurrence)}
        </span>
        {(expense.notes || expense.attachments.length > 0) && (
          <span className="flex min-w-0 items-center gap-3 text-muted-foreground text-sm">
            {expense.notes && (
              <span className="flex min-w-0 items-center gap-1">
                <MessageSquareText aria-hidden className="size-3.5 shrink-0" />
                <span className="truncate">{expense.notes}</span>
              </span>
            )}
            {expense.attachments.length > 0 && (
              <span className="flex shrink-0 items-center gap-1">
                <Paperclip aria-label="Anexos" className="size-3.5" />
                {expense.attachments.length}
              </span>
            )}
          </span>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={cn(
            "font-medium tabular-nums",
            isOverdue && "text-destructive",
            isPaid && "text-muted-foreground",
          )}
        >
          {formatCurrency(expense.amountCents)}
        </span>
        {isOverdue && <StatusBadge tone="destructive">Atrasada</StatusBadge>}
        {isPaid && <StatusBadge tone="success">Paga</StatusBadge>}
      </div>
      {!isPaid && (
        <Button
          disabled={isUpdatingPayment}
          aria-busy={isUpdatingPayment}
          onClick={() => onPay(occurrence)}
        >
          {isUpdatingPayment && <Spinner aria-hidden />}
          Pagar
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Mais ações de ${expense.description}`}
            />
          }
        >
          <Ellipsis aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {isPaid && (
            <DropdownMenuItem onClick={() => onCancelPayment(occurrence)}>
              <Undo2 aria-hidden />
              Cancelar pagamento
            </DropdownMenuItem>
          )}
          {expense.attachments.map((attachment) => (
            <DropdownMenuItem
              key={attachment.id}
              render={
                <a
                  href={buildExpenseAttachmentRoute(attachment.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <FileText aria-hidden />
              <span className="truncate">{attachment.fileName}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={() => onAction(occurrence, "edit")}>
            <Pencil aria-hidden />
            Editar
          </DropdownMenuItem>
          {canEndRecurrence(expense, todayKey) && (
            <DropdownMenuItem onClick={() => onAction(occurrence, "end")}>
              <CalendarX2 aria-hidden />
              Encerrar repetição
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onAction(occurrence, "delete")}
          >
            <Trash2 aria-hidden />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
