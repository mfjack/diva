import { requireRole } from "@/features/auth/queries";

export default async function PsychologistLayout({
  children,
}: LayoutProps<"/dashboard">) {
  await requireRole("psychologist");
  return children;
}
