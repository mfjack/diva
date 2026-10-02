"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Download, LockKeyhole, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { TextareaField } from "@/components/form/textarea-field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { Patient } from "@/features/patients/types";
import { formatDate } from "@/lib/format";
import { ROUTES } from "@/lib/routes";
import { useSaveClinicalRecordMutation } from "../hooks/use-save-clinical-record-mutation";
import { CLINICAL_RECORD_KIND_OPTIONS } from "../labels";
import { type ClinicalRecordInput, clinicalRecordSchema } from "../schemas";
import type { ClinicalRecordId, DocumentTemplate } from "../types";

const PATIENT_NAME_PLACEHOLDER = "[NOME DO PACIENTE]";
const DATE_PLACEHOLDER = "[DATA]";

type ClinicalRecordEditorProps = {
  recordId: ClinicalRecordId | null;
  defaultValues: Partial<ClinicalRecordInput>;
  patients: Pick<Patient, "id" | "fullName">[];
  templates: DocumentTemplate[];
};

function fillTemplate(content: string, patientName: string | undefined) {
  return content
    .replaceAll(
      PATIENT_NAME_PLACEHOLDER,
      patientName ?? PATIENT_NAME_PLACEHOLDER,
    )
    .replaceAll(DATE_PLACEHOLDER, formatDate(new Date()));
}

export function ClinicalRecordEditor({
  recordId,
  defaultValues,
  patients,
  templates,
}: ClinicalRecordEditorProps) {
  const router = useRouter();
  const saveRecordMutation = useSaveClinicalRecordMutation();
  const form = useForm<ClinicalRecordInput>({
    resolver: zodResolver(clinicalRecordSchema),
    defaultValues: { title: "", content: "", ...defaultValues },
  });
  const selectedPatientId = useWatch({
    control: form.control,
    name: "patientId",
  });

  const patientOptions = patients.map(({ id, fullName }) => ({
    value: id,
    label: fullName,
  }));

  function applyTemplate(template: DocumentTemplate) {
    const patientName = patients.find(
      ({ id }) => id === selectedPatientId,
    )?.fullName;
    form.setValue("kind", template.kind, { shouldValidate: true });
    form.setValue("content", fillTemplate(template.content, patientName), {
      shouldDirty: true,
    });
    if (!form.getValues("title")) {
      form.setValue("title", template.title, { shouldDirty: true });
    }
  }

  const handleSubmit = form.handleSubmit((input) => {
    saveRecordMutation.mutate(
      { recordId, input },
      {
        onSuccess: () => {
          toast.success("Documento salvo no prontuário.");
          router.push(ROUTES.psychologist.records);
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
          label="Conteúdo"
          placeholder="Escreva a evolução, o laudo ou a declaração…"
          size="large"
        />
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
          name="kind"
          label="Tipo de documento"
          options={CLINICAL_RECORD_KIND_OPTIONS}
        />

        <div className="flex flex-col gap-2">
          <span className="font-medium text-sm">Modelos</span>
          <ul className="flex flex-col gap-2">
            {templates.map((template) => (
              <li key={template.id}>
                <Button
                  type="button"
                  variant="outline"
                  className="h-auto w-full justify-start py-2.5 text-left"
                  onClick={() => applyTemplate(template)}
                >
                  {template.title}
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <p className="flex items-start gap-2 rounded-lg bg-muted p-3 text-muted-foreground text-xs">
          <LockKeyhole aria-hidden className="mt-0.5 size-3.5 shrink-0" />O
          conteúdo é criptografado e cada acesso fica registrado, conforme o
          sigilo profissional e a LGPD.
        </p>

        <div className="flex flex-col gap-2">
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
            Salvar documento
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() =>
              toast.info("A exportação em PDF assinado entra com o backend.")
            }
          >
            <Download aria-hidden />
            Exportar PDF
          </Button>
        </div>
      </aside>
    </form>
  );
}
