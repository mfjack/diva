import type { Metadata } from "next";
import { PageContent } from "@/components/layout/page-content";
import { PageHeader } from "@/components/layout/page-header";
import { getCurrentPatient } from "@/features/patients/queries";
import { listPatientPayments } from "@/features/payments/queries";
import { getPracticeSettings } from "@/features/practice-settings/queries";
import { PatientPaymentsView } from "./components/patient-payments-view";

export const metadata: Metadata = {
  title: "Pagamentos",
};

export default async function PatientPaymentsPage() {
  const patient = await getCurrentPatient();
  const [payments, settings] = await Promise.all([
    listPatientPayments(patient.id),
    getPracticeSettings(),
  ]);

  return (
    <>
      <PageHeader
        title="Pagamentos"
        description="Pague por Pix e baixe recibos para reembolso do plano ou para o Imposto de Renda."
      />
      <PageContent>
        <PatientPaymentsView
          payments={payments}
          pixKey={settings.pixKey}
          psychologistName={settings.psychologistName}
        />
      </PageContent>
    </>
  );
}
