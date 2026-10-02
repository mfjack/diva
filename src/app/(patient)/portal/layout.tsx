import { getCurrentPatient } from "@/features/patients/queries";
import { PatientBottomNavigation } from "./components/patient-bottom-navigation";
import { PatientHeader } from "./components/patient-header";

export default async function PatientLayout({
  children,
}: LayoutProps<"/portal">) {
  const patient = await getCurrentPatient();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PatientHeader patientName={patient.fullName} />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
        {children}
      </div>
      <PatientBottomNavigation />
    </div>
  );
}
