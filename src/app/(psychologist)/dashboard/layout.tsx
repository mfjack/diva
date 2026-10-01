import { requireRole } from "@/server/auth/session";

export default async function PsychologistLayout({
  children,
}: LayoutProps<"/dashboard">) {
  await requireRole("psychologist");
  return children;
}
