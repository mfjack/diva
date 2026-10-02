"use client";

import { Plus, Users } from "lucide-react";
import { useState } from "react";
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
import type { Patient } from "@/features/patients/types";
import { PatientsTable } from "./patients-table";

type PatientsViewProps = {
  patients: Patient[];
};

export function PatientsView({ patients }: PatientsViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const activeCount = patients.filter(
    ({ status }) => status === "active",
  ).length;

  return (
    <>
      <PageHeader
        title="Pacientes"
        description={`${activeCount} em atendimento · ${patients.length} no total`}
        actions={
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus aria-hidden />
            Novo paciente
          </Button>
        }
      />
      <PageContent>
        <PatientsTable
          patients={patients}
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
      <PatientFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        patientId={null}
      />
    </>
  );
}
