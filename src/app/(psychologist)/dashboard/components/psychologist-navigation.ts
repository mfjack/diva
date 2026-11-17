import {
  CalendarDays,
  FileText,
  Library,
  type LucideIcon,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";

type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  isExact?: boolean;
};

export const PSYCHOLOGIST_NAVIGATION = [
  { href: ROUTES.psychologist.schedule, label: "Agenda", icon: CalendarDays },
  { href: ROUTES.psychologist.patients, label: "Pacientes", icon: Users },
  { href: ROUTES.psychologist.records, label: "Prontuários", icon: FileText },
  { href: ROUTES.psychologist.studies, label: "Estudos", icon: Library },
  { href: ROUTES.psychologist.finance, label: "Financeiro", icon: Wallet },
] as const satisfies NavigationItem[];

export const PSYCHOLOGIST_SETTINGS_ITEM = {
  href: ROUTES.psychologist.settings,
  label: "Configurações",
  icon: Settings,
} as const satisfies NavigationItem;
