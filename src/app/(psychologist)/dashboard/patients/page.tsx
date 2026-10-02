import type { Metadata } from "next";
import { listPatients } from "@/features/patients/queries";
import { PatientsView } from "./components/patients-view";

export const metadata: Metadata = {
  title: "Pacientes",
};

export default async function PatientsPage() {
  const patients = await listPatients();
  return <PatientsView patients={patients} />;
}
