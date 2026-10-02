"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PatientFormDialog } from "@/features/patients/components/patient-form-dialog";
import { toPatientInput } from "@/features/patients/to-patient-input";
import type { Patient } from "@/features/patients/types";

type EditPatientButtonProps = {
  patient: Patient;
};

export function EditPatientButton({ patient }: EditPatientButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Pencil aria-hidden />
        Editar
      </Button>
      <PatientFormDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        patientId={patient.id}
        defaultValues={toPatientInput(patient)}
      />
    </>
  );
}
