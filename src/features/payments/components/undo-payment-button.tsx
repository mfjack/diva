"use client";

import { Undo2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dialog/confirm-dialog";
import { formatCurrency, formatDate } from "@/lib/format";
import { useUndoPaymentMutation } from "../hooks/use-undo-payment-mutation";
import type { Payment } from "../types";
import { PaymentActionButton } from "./payment-action-button";

type UndoPaymentButtonProps = {
  payment: Pick<
    Payment,
    "appointmentId" | "patientName" | "sessionStartsAt" | "amountCents"
  >;
};

function describeUndo(payment: UndoPaymentButtonProps["payment"]): string {
  const session = `Sessão de ${formatDate(payment.sessionStartsAt)} de ${payment.patientName}, ${formatCurrency(payment.amountCents)}`;
  return `${session}. O pagamento volta a ficar em aberto.`;
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
      <PaymentActionButton
        icon={Undo2}
        label="Desfazer"
        accessibleLabel={`Desfazer pagamento da sessão de ${formatDate(payment.sessionStartsAt)}`}
        tone="subtle"
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
