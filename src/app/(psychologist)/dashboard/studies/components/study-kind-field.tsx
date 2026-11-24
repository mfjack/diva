"use client";

import { useEffect, useState } from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";
import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { toStudyNoteKindOptions } from "@/features/studies/labels";
import type { StudyNoteInput } from "@/features/studies/schemas";

const NEW_KIND_VALUE = "__new-kind__";

type StudyKindFieldProps = {
  form: UseFormReturn<StudyNoteInput>;
  kinds: readonly string[];
};

export function StudyKindField({ form, kinds }: StudyKindFieldProps) {
  const [isCreating, setIsCreating] = useState(false);
  const kind = useWatch({ control: form.control, name: "kind" });
  const knownKinds = kinds.includes(kind) || !kind ? kinds : [...kinds, kind];

  useEffect(() => {
    if (kind !== NEW_KIND_VALUE) return;
    setIsCreating(true);
    form.setValue("kind", "", { shouldDirty: true });
  }, [kind, form]);

  function handleShowList() {
    setIsCreating(false);
    if (!form.getValues("kind")) {
      form.setValue("kind", kinds[0] ?? "", { shouldDirty: true });
    }
  }

  if (isCreating) {
    return (
      <TextField
        control={form.control}
        name="kind"
        label="Novo tipo"
        placeholder="Ex.: Grupo de estudos"
        labelAction={
          <button
            type="button"
            onClick={handleShowList}
            className="font-medium text-primary text-xs hover:underline"
          >
            Escolher da lista
          </button>
        }
      />
    );
  }

  return (
    <SelectField
      control={form.control}
      name="kind"
      label="Tipo"
      options={[
        ...toStudyNoteKindOptions(knownKinds),
        { value: NEW_KIND_VALUE, label: "+ Novo tipo" },
      ]}
    />
  );
}
