"use client";

import { CircleCheck } from "lucide-react";
import { useState } from "react";
import { DataTableRowActionButton } from "@/components/data-table/data-table-row-action-button";
import { formatDate } from "@/lib/format";
import {
  type PaymentTarget,
  RegisterPaymentDialog,
} from "./register-payment-dialog";

type RegisterPaymentButtonProps = {
  target: PaymentTarget;
};

export function RegisterPaymentButton({ target }: RegisterPaymentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  function handleOpen() {
    setIsOpen(true);
  }

  return (
    <>
      <DataTableRowActionButton
        label="Registrar pagamento"
        accessibleLabel={`Registrar pagamento da sessão de ${formatDate(target.sessionStartsAt)}`}
        icon={CircleCheck}
        onClick={handleOpen}
      />
      <RegisterPaymentDialog
        target={isOpen ? target : null}
        onOpenChange={setIsOpen}
      />
    </>
  );
}
