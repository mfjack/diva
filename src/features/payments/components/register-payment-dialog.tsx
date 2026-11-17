"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormDialog } from "@/components/dialog/form-dialog";
import { DateField } from "@/components/form/date-field";
import { SelectField } from "@/components/form/select-field";
import { TextareaField } from "@/components/form/textarea-field";
import { formatCurrency, formatDate } from "@/lib/format";
import { useRegisterPaymentMutation } from "../hooks/use-register-payment-mutation";
import { PAYMENT_METHOD_OPTIONS } from "../labels";
import { type RegisterPaymentInput, registerPaymentSchema } from "../schemas";
import type { Payment } from "../types";

export type PaymentTarget = Pick<
  Payment,
  "appointmentId" | "patientName" | "sessionStartsAt" | "amountCents"
>;

type RegisterPaymentDialogProps = {
  target: PaymentTarget | null;
  onOpenChange: (isOpen: boolean) => void;
};

export function RegisterPaymentDialog({
  target,
  onOpenChange,
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

  function handleRegistered() {
    toast.success("Pagamento registrado.");
    handleOpenChange(false);
  }

  function handleError(error: Error) {
    toast.error(error.message);
  }

  const handleSubmit = form.handleSubmit((input) => {
    if (!target) return;
    registerPaymentMutation.mutate(
      { appointmentId: target.appointmentId, input },
      { onSuccess: handleRegistered, onError: handleError },
    );
  });

  return (
    <FormDialog
      isOpen={target !== null}
      onOpenChange={handleOpenChange}
      title="Registrar pagamento"
      description={
        target
          ? `${target.patientName} · sessão de ${formatDate(target.sessionStartsAt)} · ${formatCurrency(target.amountCents)}`
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
          <DateField
            control={form.control}
            name="paidOn"
            label="Data"
            allowedDates="up-to-today"
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
