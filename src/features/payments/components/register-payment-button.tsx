"use client";

import { HandCoins } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/format";
import { PaymentActionButton } from "./payment-action-button";
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
      <PaymentActionButton
        icon={HandCoins}
        label="Receber"
        accessibleLabel={`Registrar pagamento da sessão de ${formatDate(target.sessionStartsAt)}`}
        onClick={handleOpen}
      />
      <RegisterPaymentDialog
        target={isOpen ? target : null}
        onOpenChange={setIsOpen}
      />
    </>
  );
}
