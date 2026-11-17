"use client";

import { Plus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  ConfirmDialog,
  IRREVERSIBLE_ACTION_MESSAGE,
} from "@/components/dialog/confirm-dialog";
import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PatientFormDialog } from "@/features/patients/components/patient-form-dialog";
import { useDeletePatientMutation } from "@/features/patients/hooks/use-delete-patient-mutation";
import { toPatientInput } from "@/features/patients/to-patient-input";
import type { Patient } from "@/features/patients/types";
import { PatientsTable } from "./patients-table";

type PatientFormTarget =
  | { mode: "create" }
  | { mode: "edit"; patient: Patient };

type PatientsViewProps = {
  patients: Patient[];
};

export function PatientsView({ patients }: PatientsViewProps) {
  const [formTarget, setFormTarget] = useState<PatientFormTarget | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const deletePatientMutation = useDeletePatientMutation();
  const activeCount = patients.filter(
    ({ status }) => status === "active",
  ).length;

  function handleCreateRequest() {
    setFormTarget({ mode: "create" });
  }

  function handleEditRequest(patient: Patient) {
    setFormTarget({ mode: "edit", patient });
  }

  function handleFormOpenChange(isOpen: boolean) {
    if (!isOpen) setFormTarget(null);
  }

  function handleDeleteOpenChange(isOpen: boolean) {
    if (!isOpen) setPatientToDelete(null);
  }

  function handleDeleted() {
    toast.success("Paciente excluído.");
    setPatientToDelete(null);
  }

  function handleDeleteConfirm() {
    if (!patientToDelete) return;
    deletePatientMutation.mutate(patientToDelete.id, {
      onSuccess: handleDeleted,
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <div className="flex flex-1 flex-col md:h-svh md:flex-none md:overflow-hidden">
      <PageHeader
        title="Pacientes"
        description={`${activeCount} em atendimento · ${patients.length} no total`}
        actions={
          <Button onClick={handleCreateRequest}>
            <Plus aria-hidden />
            Novo paciente
          </Button>
        }
      />
      <PageContent className="md:min-h-0 md:pb-6">
        <PatientsTable
          patients={patients}
          onEditRequest={handleEditRequest}
          onDeleteRequest={setPatientToDelete}
          emptyState={
            <Empty className="flex-1 border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Users aria-hidden />
                </EmptyMedia>
                <EmptyTitle>Nenhum paciente ainda</EmptyTitle>
                <EmptyDescription>
                  Cadastre o primeiro paciente para começar a agendar sessões.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          }
        />
      </PageContent>
      <ConfirmDialog
        isOpen={patientToDelete !== null}
        onOpenChange={handleDeleteOpenChange}
        title="Excluir paciente"
        description={
          patientToDelete
            ? `${patientToDelete.fullName} sai da lista de pacientes e as sessões futuras são canceladas. O histórico e o prontuário continuam guardados. ${IRREVERSIBLE_ACTION_MESSAGE}`
            : ""
        }
        confirmLabel="Excluir paciente"
        isConfirming={deletePatientMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
      {formTarget?.mode === "edit" ? (
        <PatientFormDialog
          key={formTarget.patient.id}
          isOpen
          onOpenChange={handleFormOpenChange}
          patientId={formTarget.patient.id}
          defaultValues={toPatientInput(formTarget.patient)}
        />
      ) : (
        <PatientFormDialog
          isOpen={formTarget?.mode === "create"}
          onOpenChange={handleFormOpenChange}
          patientId={null}
        />
      )}
    </div>
  );
}
