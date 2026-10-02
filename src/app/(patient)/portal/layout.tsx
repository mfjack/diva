import { requireRole } from "@/features/auth/queries";

export default async function PatientLayout({
  children,
}: LayoutProps<"/portal">) {
  await requireRole("patient");
  return children;
}
