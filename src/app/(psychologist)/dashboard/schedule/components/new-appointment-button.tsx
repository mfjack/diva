"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/dialog/confirm-dialog";
import { Button } from "@/components/ui/button";
import { PatientFormDialog } from "@/features/patients/components/patient-form-dialog";
import type { Patient } from "@/features/patients/types";
import type { SessionAvailability } from "@/features/practice-settings/availability";
import { NewAppointmentDialog } from "./new-appointment-dialog";

type OpenDialog = "appointment" | "missing-patient" | "patient-form" | null;

type NewAppointmentButtonProps = {
  patients: Patient[];
  availability: SessionAvailability;
};

export function NewAppointmentButton({
  patients,
  availability,
}: NewAppointmentButtonProps) {
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null);
  const hasActivePatients = patients.some(({ status }) => status === "active");

  function handleOpen() {
    setOpenDialog(hasActivePatients ? "appointment" : "missing-patient");
  }

  function handleRegisterPatient() {
    setOpenDialog("patient-form");
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) setOpenDialog(null);
  }

  return (
    <>
      <Button size="lg" onClick={handleOpen}>
        <Plus aria-hidden />
        Nova sessão
      </Button>
      <NewAppointmentDialog
        isOpen={openDialog === "appointment"}
        onOpenChange={handleOpenChange}
        patients={patients}
        availability={availability}
      />
      <ConfirmDialog
        isOpen={openDialog === "missing-patient"}
        onOpenChange={handleOpenChange}
        title="Nenhum paciente cadastrado"
        description="Para agendar uma sessão, cadastre o primeiro paciente. Leva menos de um minuto."
        confirmLabel="Cadastrar paciente"
        cancelLabel="Agora não"
        tone="default"
        isConfirming={false}
        onConfirm={handleRegisterPatient}
      />
      <PatientFormDialog
        isOpen={openDialog === "patient-form"}
        onOpenChange={handleOpenChange}
        patientId={null}
      />
    </>
  );
}
