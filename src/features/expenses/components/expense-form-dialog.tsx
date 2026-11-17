"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FormDialog } from "@/components/dialog/form-dialog";
import { DateField } from "@/components/form/date-field";
import { NumberField } from "@/components/form/number-field";
import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { TextareaField } from "@/components/form/textarea-field";
import { useSaveExpenseMutation } from "../hooks/use-save-expense-mutation";
import { useUploadExpenseAttachmentMutation } from "../hooks/use-upload-expense-attachment-mutation";
import {
  EXPENSE_CATEGORY_OPTIONS,
  EXPENSE_RECURRENCE_OPTIONS,
} from "../labels";
import {
  EMPTY_EXPENSE_INPUT,
  type ExpenseInput,
  expenseSchema,
} from "../schemas";
import type { ExpenseAttachment, ExpenseId } from "../types";
import { ExpenseAttachmentsInput } from "./expense-attachments-input";

type ExpenseFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  expenseId?: ExpenseId | null;
  defaultValues?: Partial<ExpenseInput>;
  attachments?: readonly ExpenseAttachment[];
};

export function ExpenseFormDialog({
  isOpen,
  onOpenChange,
  expenseId = null,
  defaultValues = EMPTY_EXPENSE_INPUT,
  attachments = [],
}: ExpenseFormDialogProps) {
  const saveExpenseMutation = useSaveExpenseMutation();
  const uploadAttachmentMutation = useUploadExpenseAttachmentMutation();
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const form = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues,
  });
  const recurrence = useWatch({ control: form.control, name: "recurrence" });
  const isInstallments = recurrence === "installments";
  const isEditing = expenseId !== null;

  function handleOpenChange(nextIsOpen: boolean) {
    if (!nextIsOpen) {
      form.reset(EMPTY_EXPENSE_INPUT);
      setPendingFiles([]);
    }
    onOpenChange(nextIsOpen);
  }

  async function uploadPendingFiles(savedExpenseId: ExpenseId) {
    for (const file of pendingFiles) {
      try {
        await uploadAttachmentMutation.mutateAsync({
          expenseId: savedExpenseId,
          file,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        toast.error(`${file.name}: ${message}`);
      }
    }
  }

  const handleSubmit = form.handleSubmit((input) => {
    saveExpenseMutation.mutate(
      { expenseId, input },
      {
        onSuccess: async ({ expenseId: savedExpenseId }) => {
          await uploadPendingFiles(savedExpenseId);
          toast.success(
            isEditing ? "Despesa atualizada." : "Despesa registrada.",
          );
          handleOpenChange(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  });

  return (
    <FormDialog
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      title={isEditing ? "Editar despesa" : "Nova despesa"}
      size="medium"
      description="Gastos do consultório, como supervisão, cursos e materiais."
      submitLabel={isEditing ? "Salvar" : "Registrar"}
      isSubmitting={
        saveExpenseMutation.isPending || uploadAttachmentMutation.isPending
      }
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-5">
        <TextField
          control={form.control}
          name="description"
          label="Descrição"
          placeholder="Ex.: Supervisão clínica de novembro"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            control={form.control}
            name="category"
            label="Categoria"
            placeholder="Selecione a categoria"
            options={EXPENSE_CATEGORY_OPTIONS}
          />
          <NumberField
            control={form.control}
            name="amount"
            label={isInstallments ? "Valor de cada parcela" : "Valor"}
            format="currency"
            placeholder="Ex.: $ 250,00"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            control={form.control}
            name="recurrence"
            label="Repetição"
            placeholder="Selecione a repetição"
            options={EXPENSE_RECURRENCE_OPTIONS}
          />
          <DateField
            control={form.control}
            name="startsOn"
            label={isInstallments ? "Primeira parcela" : "Data"}
          />
          {isInstallments && (
            <NumberField
              control={form.control}
              name="installmentCount"
              label="Número de parcelas"
              format="integer"
              suffix="x"
              placeholder="Ex.: 6x"
            />
          )}
        </div>
        <TextareaField
          control={form.control}
          name="notes"
          label="Observação"
          placeholder="Ex.: Inclui o material do curso"
        />
        <ExpenseAttachmentsInput
          expenseId={expenseId}
          attachments={attachments}
          pendingFiles={pendingFiles}
          onPendingFilesChange={setPendingFiles}
        />
      </div>
    </FormDialog>
  );
}
