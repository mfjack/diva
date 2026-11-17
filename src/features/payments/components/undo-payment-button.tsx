"use client";

import { Undo2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DataTableRowActionButton } from "@/components/data-table/data-table-row-action-button";
import { ConfirmDialog } from "@/components/dialog/confirm-dialog";
import { formatCurrency, formatDate } from "@/lib/format";
import { useUndoPaymentMutation } from "../hooks/use-undo-payment-mutation";
import type { Payment } from "../types";

type UndoPaymentButtonProps = {
  payment: Pick<
    Payment,
    | "appointmentId"
    | "patientName"
    | "sessionStartsAt"
    | "amountCents"
    | "receiptNumber"
  >;
};

function describeUndo(payment: UndoPaymentButtonProps["payment"]): string {
  const session = `Sessão de ${formatDate(payment.sessionStartsAt)} de ${payment.patientName}, ${formatCurrency(payment.amountCents)}`;
  const receipt = payment.receiptNumber
    ? ` O recibo nº ${payment.receiptNumber} deixa de valer.`
    : "";
  return `${session}. O pagamento volta a ficar em aberto.${receipt}`;
}

export function UndoPaymentButton({ payment }: UndoPaymentButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const undoPaymentMutation = useUndoPaymentMutation();

  function handleOpen() {
    setIsConfirmOpen(true);
  }

  function handleConfirm() {
    undoPaymentMutation.mutate(payment.appointmentId, {
      onSuccess: () => {
        toast.success("Pagamento desfeito.");
        setIsConfirmOpen(false);
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <>
      <DataTableRowActionButton
        label="Desfazer pagamento"
        accessibleLabel={`Desfazer pagamento da sessão de ${formatDate(payment.sessionStartsAt)}`}
        icon={Undo2}
        onClick={handleOpen}
      />
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Desfazer pagamento"
        description={describeUndo(payment)}
        confirmLabel="Desfazer"
        isConfirming={undoPaymentMutation.isPending}
        onConfirm={handleConfirm}
      />
    </>
  );
}
