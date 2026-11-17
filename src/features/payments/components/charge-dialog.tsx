"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { FormDialog } from "@/components/dialog/form-dialog";
import { TextareaField } from "@/components/form/textarea-field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ROUTES } from "@/lib/routes";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { buildChargeMessage, type ChargeItem } from "../charge-message";
import { type ChargeMessageInput, chargeMessageSchema } from "../schemas";

export type ChargeTarget = {
  patientName: string;
  patientPhone: string;
  items: readonly ChargeItem[];
};

type ChargeDialogProps = {
  target: ChargeTarget | null;
  pixKey: string | null;
  onOpenChange: (isOpen: boolean) => void;
};

const PAYMENT_SETTINGS_HREF = `${ROUTES.psychologist.settings}?tab=practice`;

export function ChargeDialog({
  target,
  pixKey,
  onOpenChange,
}: ChargeDialogProps) {
  const values = useMemo(
    () =>
      target
        ? { message: buildChargeMessage({ ...target, pixKey }) }
        : undefined,
    [target, pixKey],
  );
  const form = useForm<ChargeMessageInput>({
    resolver: zodResolver(chargeMessageSchema),
    defaultValues: { message: "" },
    values,
  });

  const handleSubmit = form.handleSubmit(({ message }) => {
    if (!target) return;
    window.open(
      getWhatsAppUrl(target.patientPhone, message),
      "_blank",
      "noopener,noreferrer",
    );
    onOpenChange(false);
  });

  return (
    <FormDialog
      isOpen={target !== null}
      onOpenChange={onOpenChange}
      title="Cobrar pagamento"
      description={
        target
          ? `A mensagem abre no WhatsApp de ${target.patientName}. Revise antes de enviar.`
          : undefined
      }
      submitLabel="Abrir no WhatsApp"
      isSubmitting={false}
      onSubmit={handleSubmit}
      size="medium"
    >
      <div className="flex flex-col gap-4">
        {!pixKey && (
          <Alert>
            <TriangleAlert aria-hidden />
            <AlertTitle>Sem chave Pix cadastrada</AlertTitle>
            <AlertDescription>
              <span>
                Cadastre sua chave em{" "}
                <Link
                  href={PAYMENT_SETTINGS_HREF}
                  className="font-medium underline underline-offset-4"
                >
                  Configurações
                </Link>{" "}
                para ela aparecer nas cobranças.
              </span>
            </AlertDescription>
          </Alert>
        )}
        <TextareaField
          control={form.control}
          name="message"
          label="Mensagem"
          size="medium"
        />
      </div>
    </FormDialog>
  );
}
