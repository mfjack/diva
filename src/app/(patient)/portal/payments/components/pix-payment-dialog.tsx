"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DetailsDialog } from "@/components/dialog/details-dialog";
import { DIALOG_ACTION_BUTTON_CLASS_NAME } from "@/components/dialog/dialog-styles";
import { Button } from "@/components/ui/button";
import type { Payment } from "@/features/payments/types";
import { formatCurrency, formatDate } from "@/lib/format";

const COPIED_FEEDBACK_MS = 2000;

type PixPaymentDialogProps = {
  payment: Payment | null;
  pixKey: string;
  psychologistName: string;
  onOpenChange: (isOpen: boolean) => void;
};

export function PixPaymentDialog({
  payment,
  pixKey,
  psychologistName,
  onOpenChange,
}: PixPaymentDialogProps) {
  const [hasCopied, setHasCopied] = useState(false);

  async function copyPixKey() {
    try {
      await navigator.clipboard.writeText(pixKey);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      toast.error("Não foi possível copiar. Selecione a chave e copie.");
    }
  }

  function handlePaid() {
    toast.success("Obrigado! A psicóloga vai confirmar o recebimento.");
    onOpenChange(false);
  }

  return (
    <DetailsDialog
      isOpen={payment !== null}
      onOpenChange={onOpenChange}
      title="Pagar com Pix"
      footer={
        <>
          <Button
            variant="outline"
            className={DIALOG_ACTION_BUTTON_CLASS_NAME}
            onClick={() => onOpenChange(false)}
          >
            Depois
          </Button>
          <Button
            className={DIALOG_ACTION_BUTTON_CLASS_NAME}
            onClick={handlePaid}
          >
            Já paguei
          </Button>
        </>
      }
    >
      {payment && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-sm">
              Sessão de {formatDate(payment.sessionStartsAt)}
            </span>
            <span className="font-semibold text-4xl tabular-nums">
              {formatCurrency(payment.amountCents)}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-muted-foreground text-sm">
              Chave Pix de {psychologistName}
            </span>
            <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
              <code className="min-w-0 flex-1 break-all text-sm">{pixKey}</code>
              <Button
                variant="outline"
                size="sm"
                onClick={copyPixKey}
                aria-live="polite"
              >
                {hasCopied ? <Check aria-hidden /> : <Copy aria-hidden />}
                {hasCopied ? "Copiada" : "Copiar"}
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground text-xs">
            Abra o app do seu banco, escolha Pix, cole a chave e informe o
            valor. Com o backend, aqui aparece também o QR Code com o valor
            preenchido.
          </p>
        </div>
      )}
    </DetailsDialog>
  );
}
