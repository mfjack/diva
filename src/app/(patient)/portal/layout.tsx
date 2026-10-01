import { requireRole } from "@/server/auth/session";

export default async function PatientLayout({
  children,
}: LayoutProps<"/portal">) {
  await requireRole("patient");
  return children;
}
