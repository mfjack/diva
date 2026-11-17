"use client";

import { ChevronDown, Wallet } from "lucide-react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import {
  ConfirmDialog,
  IRREVERSIBLE_ACTION_MESSAGE,
} from "@/components/dialog/confirm-dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ExpenseFormDialog } from "@/features/expenses/components/expense-form-dialog";
import { useCancelExpensePaymentMutation } from "@/features/expenses/hooks/use-cancel-expense-payment-mutation";
import { useDeleteExpenseMutation } from "@/features/expenses/hooks/use-delete-expense-mutation";
import { useEndExpenseRecurrenceMutation } from "@/features/expenses/hooks/use-end-expense-recurrence-mutation";
import { useMarkExpensePaidMutation } from "@/features/expenses/hooks/use-mark-expense-paid-mutation";
import {
  type ExpenseMonthGroups,
  getOccurrenceKey,
  sumOccurrences,
} from "@/features/expenses/occurrences";
import { toExpenseInput } from "@/features/expenses/to-expense-input";
import type { ExpenseOccurrence } from "@/features/expenses/types";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ExpenseRow, type ExpenseRowAction } from "./expense-row";

type ExpenseActionTarget = {
  occurrence: ExpenseOccurrence;
  action: ExpenseRowAction;
};

type OccurrenceGroupProps = {
  title: string;
  occurrences: ExpenseOccurrence[];
  isHighlighted?: boolean;
  renderRow: (occurrence: ExpenseOccurrence) => ReactNode;
};

function OccurrenceGroup({
  title,
  occurrences,
  isHighlighted = false,
  renderRow,
}: OccurrenceGroupProps) {
  if (occurrences.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <header
        className={cn(
          "flex items-center justify-between px-1 font-medium text-sm",
          isHighlighted ? "text-destructive" : "text-muted-foreground",
        )}
      >
        <h3>
          {title} ({occurrences.length})
        </h3>
        <span className="tabular-nums">
          {formatCurrency(sumOccurrences(occurrences))}
        </span>
      </header>
      <ul className="flex flex-col gap-2">{occurrences.map(renderRow)}</ul>
    </section>
  );
}

type PaidGroupProps = {
  occurrences: ExpenseOccurrence[];
  renderRow: (occurrence: ExpenseOccurrence) => ReactNode;
};

function PaidGroup({ occurrences, renderRow }: PaidGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (occurrences.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((wasExpanded) => !wasExpanded)}
        className="flex w-fit items-center gap-1.5 px-1 font-medium text-muted-foreground text-sm hover:text-foreground"
      >
        Pagas no mês ({occurrences.length}) ·{" "}
        {formatCurrency(sumOccurrences(occurrences))}
        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 transition-transform",
            isExpanded && "rotate-180",
          )}
        />
      </button>
      {isExpanded && (
        <ul className="flex flex-col gap-2">{occurrences.map(renderRow)}</ul>
      )}
    </section>
  );
}

function getConfirmDescription({
  occurrence: { expense },
  action,
}: ExpenseActionTarget): string {
  if (action === "end") {
    return `${expense.description} deixa de se repetir a partir de hoje. Os lançamentos anteriores continuam no histórico.`;
  }
  const repetitionNote =
    expense.recurrence === "once"
      ? ""
      : " Todas as repetições e pagamentos saem junto.";
  return `${expense.description}.${repetitionNote} ${IRREVERSIBLE_ACTION_MESSAGE}`;
}

type ExpensesBoardProps = {
  groups: ExpenseMonthGroups;
  todayKey: string;
};

export function ExpensesBoard({ groups, todayKey }: ExpensesBoardProps) {
  const [target, setTarget] = useState<ExpenseActionTarget | null>(null);
  const markPaidMutation = useMarkExpensePaidMutation();
  const cancelPaymentMutation = useCancelExpensePaymentMutation();
  const deleteExpenseMutation = useDeleteExpenseMutation();
  const endRecurrenceMutation = useEndExpenseRecurrenceMutation();
  const isEnding = target?.action === "end";
  const pendingPaymentKey =
    markPaidMutation.isPending && markPaidMutation.variables
      ? getOccurrenceKey(
          markPaidMutation.variables.expenseId,
          markPaidMutation.variables.dueOn,
        )
      : null;

  function handlePay({ expense, dueOn }: ExpenseOccurrence) {
    markPaidMutation.mutate(
      { expenseId: expense.id, dueOn },
      {
        onSuccess: () => toast.success("Conta marcada como paga."),
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function handleCancelPayment({ expense, dueOn }: ExpenseOccurrence) {
    cancelPaymentMutation.mutate(
      { expenseId: expense.id, dueOn },
      {
        onSuccess: () => toast.success("Pagamento cancelado."),
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function handleAction(
    occurrence: ExpenseOccurrence,
    action: ExpenseRowAction,
  ) {
    setTarget({ occurrence, action });
  }

  function handleDialogOpenChange(isOpen: boolean) {
    if (!isOpen) setTarget(null);
  }

  function handleConfirm() {
    if (!target) return;
    const mutation = isEnding ? endRecurrenceMutation : deleteExpenseMutation;
    mutation.mutate(target.occurrence.expense.id, {
      onSuccess: () => {
        toast.success(isEnding ? "Repetição encerrada." : "Despesa excluída.");
        setTarget(null);
      },
      onError: (error) => toast.error(error.message),
    });
  }

  function renderRow(occurrence: ExpenseOccurrence) {
    const occurrenceKey = getOccurrenceKey(
      occurrence.expense.id,
      occurrence.dueOn,
    );
    return (
      <ExpenseRow
        key={occurrenceKey}
        occurrence={occurrence}
        todayKey={todayKey}
        isUpdatingPayment={pendingPaymentKey === occurrenceKey}
        onPay={handlePay}
        onCancelPayment={handleCancelPayment}
        onAction={handleAction}
      />
    );
  }

  const hasOccurrences =
    groups.overdue.length + groups.upcoming.length + groups.paid.length > 0;

  if (!hasOccurrences) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Wallet aria-hidden />
          </EmptyMedia>
          <EmptyTitle>Nenhuma conta neste mês</EmptyTitle>
          <EmptyDescription>
            Registre supervisão, cursos, materiais e outros gastos do
            consultório.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <OccurrenceGroup
        title="Atrasadas"
        occurrences={groups.overdue}
        isHighlighted
        renderRow={renderRow}
      />
      <OccurrenceGroup
        title="A vencer"
        occurrences={groups.upcoming}
        renderRow={renderRow}
      />
      <PaidGroup occurrences={groups.paid} renderRow={renderRow} />

      {target?.action === "edit" ? (
        <ExpenseFormDialog
          key={target.occurrence.expense.id}
          isOpen
          onOpenChange={handleDialogOpenChange}
          expenseId={target.occurrence.expense.id}
          defaultValues={toExpenseInput(target.occurrence.expense)}
          attachments={target.occurrence.expense.attachments}
        />
      ) : (
        <ConfirmDialog
          isOpen={target !== null}
          onOpenChange={handleDialogOpenChange}
          title={isEnding ? "Encerrar repetição" : "Excluir despesa"}
          description={target ? getConfirmDescription(target) : ""}
          confirmLabel={isEnding ? "Encerrar" : "Excluir"}
          tone={isEnding ? "default" : "destructive"}
          isConfirming={
            deleteExpenseMutation.isPending || endRecurrenceMutation.isPending
          }
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
