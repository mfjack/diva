"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { AttachmentsPanel } from "@/components/attachments/attachments-panel";
import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { TextareaField } from "@/components/form/textarea-field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { Patient } from "@/features/patients/types";
import { formatDate, formatTime } from "@/lib/format";
import { buildClinicalRecordAttachmentRoute, ROUTES } from "@/lib/routes";
import { useDeleteClinicalRecordAttachmentMutation } from "../hooks/use-delete-clinical-record-attachment-mutation";
import { useSaveClinicalRecordMutation } from "../hooks/use-save-clinical-record-mutation";
import { useSessionOptionsQuery } from "../hooks/use-session-options-query";
import { useUploadClinicalRecordAttachmentMutation } from "../hooks/use-upload-clinical-record-attachment-mutation";
import { type ClinicalRecordInput, clinicalRecordSchema } from "../schemas";
import type {
  ClinicalRecordAttachment,
  ClinicalRecordAttachmentId,
  ClinicalRecordId,
  SessionOption,
} from "../types";

type ClinicalRecordEditorProps = {
  recordId: ClinicalRecordId | null;
  defaultValues: Partial<ClinicalRecordInput>;
  patients: Pick<Patient, "id" | "fullName">[];
  attachments: readonly ClinicalRecordAttachment[];
};

function toSessionOption({ appointmentId, startsAt }: SessionOption) {
  return {
    value: appointmentId,
    label: `${formatDate(startsAt)} às ${formatTime(startsAt)}`,
  };
}

export function ClinicalRecordEditor({
  recordId,
  defaultValues,
  patients,
  attachments,
}: ClinicalRecordEditorProps) {
  const router = useRouter();
  const saveRecordMutation = useSaveClinicalRecordMutation();
  const uploadAttachmentMutation = useUploadClinicalRecordAttachmentMutation();
  const deleteAttachmentMutation = useDeleteClinicalRecordAttachmentMutation();
  const form = useForm<ClinicalRecordInput>({
    resolver: zodResolver(clinicalRecordSchema),
    defaultValues: {
      title: "",
      content: "",
      appointmentId: "",
      ...defaultValues,
    },
  });
  const selectedPatientId = useWatch({
    control: form.control,
    name: "patientId",
  });
  const sessionOptionsQuery = useSessionOptionsQuery(selectedPatientId);
  const previousPatientIdRef = useRef(defaultValues.patientId);

  useEffect(() => {
    if (selectedPatientId === previousPatientIdRef.current) return;
    previousPatientIdRef.current = selectedPatientId;
    form.setValue("appointmentId", "", { shouldDirty: true });
  }, [selectedPatientId, form]);

  const patientOptions = patients.map(({ id, fullName }) => ({
    value: id,
    label: fullName,
  }));

  function handleUploadAttachment(file: File) {
    if (!recordId) return;
    uploadAttachmentMutation.mutate(
      { recordId, file },
      {
        onSuccess: () => toast.success("Documento anexado."),
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function handleRemoveAttachment(attachmentId: string) {
    if (!recordId) return;
    deleteAttachmentMutation.mutate(
      {
        recordId,
        attachmentId: attachmentId as ClinicalRecordAttachmentId,
      },
      { onError: (error) => toast.error(error.message) },
    );
  }

  const handleSubmit = form.handleSubmit((input) => {
    saveRecordMutation.mutate(
      { recordId, input },
      {
        onSuccess: ({ id }) => {
          toast.success("Anotações salvas no prontuário.");
          if (!recordId) router.push(`${ROUTES.psychologist.records}/${id}`);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  });

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-8 lg:grid-cols-3"
    >
      <div className="flex flex-col gap-5 lg:col-span-2">
        <TextField
          control={form.control}
          name="title"
          label="Título"
          placeholder="Ex.: Sessão 12: retomada de metas"
        />
        <TextareaField
          control={form.control}
          name="content"
          label="Anotações da sessão"
          placeholder="Como foi a sessão, intervenções, observações e próximos passos…"
          size="large"
        />
        {recordId ? (
          <AttachmentsPanel
            title="Documentos anexados"
            attachments={attachments}
            getAttachmentHref={buildClinicalRecordAttachmentRoute}
            isUploading={uploadAttachmentMutation.isPending}
            removingAttachmentId={
              deleteAttachmentMutation.isPending
                ? (deleteAttachmentMutation.variables?.attachmentId ?? null)
                : null
            }
            onUpload={handleUploadAttachment}
            onRemove={handleRemoveAttachment}
          />
        ) : (
          <p className="rounded-lg border border-dashed p-3 text-muted-foreground text-sm">
            Salve as anotações para anexar documentos.
          </p>
        )}
      </div>

      <aside className="flex flex-col gap-5 lg:self-start">
        <SelectField
          control={form.control}
          name="patientId"
          label="Paciente"
          placeholder="Selecione o paciente"
          options={patientOptions}
        />
        <SelectField
          control={form.control}
          name="appointmentId"
          label="Sessão"
          placeholder={
            selectedPatientId ? "Escolha a sessão" : "Escolha o paciente antes"
          }
          options={(sessionOptionsQuery.data ?? []).map(toSessionOption)}
          isDisabled={!selectedPatientId}
          description="As anotações ficam ligadas a essa sessão na agenda."
        />

        <p className="flex items-start gap-2 rounded-lg bg-muted p-3 text-muted-foreground text-sm">
          <LockKeyhole aria-hidden className="mt-0.5 size-3.5 shrink-0" />O
          conteúdo e os anexos são criptografados, e cada acesso fica
          registrado, conforme o sigilo profissional e a LGPD.
        </p>

        <Button
          type="submit"
          className="h-11"
          disabled={saveRecordMutation.isPending}
        >
          {saveRecordMutation.isPending ? (
            <Spinner aria-hidden />
          ) : (
            <Save aria-hidden />
          )}
          Salvar anotações
        </Button>
      </aside>
    </form>
  );
}
