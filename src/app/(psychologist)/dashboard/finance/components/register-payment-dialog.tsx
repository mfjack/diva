"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormDialog } from "@/components/dialog/form-dialog";
import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { TextareaField } from "@/components/form/textarea-field";
import { useRegisterPaymentMutation } from "@/features/payments/hooks/use-register-payment-mutation";
import { PAYMENT_METHOD_OPTIONS } from "@/features/payments/labels";
import {
  type RegisterPaymentInput,
  registerPaymentSchema,
} from "@/features/payments/schemas";
import type { Payment, PaymentId } from "@/features/payments/types";
import { zonedDateTime } from "@/lib/dates";
import { formatCurrency, formatDate } from "@/lib/format";

const DEFAULT_PAYMENT_TIME = "12:00";

type RegisterPaymentDialogProps = {
  payment: Payment | null;
  onOpenChange: (isOpen: boolean) => void;
  onRegistered: (paymentId: PaymentId, changes: Partial<Payment>) => void;
};

export function RegisterPaymentDialog({
  payment,
  onOpenChange,
  onRegistered,
}: RegisterPaymentDialogProps) {
  const registerPaymentMutation = useRegisterPaymentMutation();
  const form = useForm<RegisterPaymentInput>({
    resolver: zodResolver(registerPaymentSchema),
    defaultValues: { paidOn: "", notes: "" },
  });

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) form.reset();
    onOpenChange(isOpen);
  }

  const handleSubmit = form.handleSubmit((input) => {
    if (!payment) return;
    registerPaymentMutation.mutate(
      { paymentId: payment.id, input },
      {
        onSuccess: () => {
          onRegistered(payment.id, {
            status: "paid",
            method: input.method,
            paidAt: zonedDateTime(
              input.paidOn,
              DEFAULT_PAYMENT_TIME,
            ).toISOString(),
          });
          toast.success("Pagamento registrado.");
          handleOpenChange(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  });

  return (
    <FormDialog
      isOpen={payment !== null}
      onOpenChange={handleOpenChange}
      title="Registrar pagamento"
      description={
        payment
          ? `${payment.patientName} · sessão de ${formatDate(payment.sessionStartsAt)} · ${formatCurrency(payment.amountCents)}`
          : undefined
      }
      submitLabel="Registrar"
      isSubmitting={registerPaymentMutation.isPending}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            control={form.control}
            name="method"
            label="Forma de pagamento"
            options={PAYMENT_METHOD_OPTIONS}
          />
          <TextField
            control={form.control}
            name="paidOn"
            label="Data"
            type="date"
          />
        </div>
        <TextareaField
          control={form.control}
          name="notes"
          label="Observação"
          placeholder="Opcional"
        />
      </div>
    </FormDialog>
  );
}
