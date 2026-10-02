import {
  CalendarDays,
  CalendarPlus,
  House,
  type LucideIcon,
  ReceiptText,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";

type PatientNavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  isExact?: boolean;
};

export const PATIENT_NAVIGATION = [
  { href: ROUTES.patient.home, label: "Início", icon: House, isExact: true },
  { href: ROUTES.patient.book, label: "Agendar", icon: CalendarPlus },
  {
    href: ROUTES.patient.appointments,
    label: "Consultas",
    icon: CalendarDays,
  },
  { href: ROUTES.patient.payments, label: "Pagamentos", icon: ReceiptText },
] as const satisfies PatientNavigationItem[];

export function isNavigationItemActive(
  pathname: string,
  { href, isExact }: Pick<PatientNavigationItem, "href" | "isExact">,
): boolean {
  return isExact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}
