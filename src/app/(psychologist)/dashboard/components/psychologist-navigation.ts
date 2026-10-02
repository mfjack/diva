import {
  CalendarDays,
  FileText,
  LayoutDashboard,
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
  {
    href: ROUTES.psychologist.dashboard,
    label: "Painel",
    icon: LayoutDashboard,
    isExact: true,
  },
  { href: ROUTES.psychologist.schedule, label: "Agenda", icon: CalendarDays },
  { href: ROUTES.psychologist.patients, label: "Pacientes", icon: Users },
  { href: ROUTES.psychologist.finance, label: "Financeiro", icon: Wallet },
  { href: ROUTES.psychologist.records, label: "Prontuários", icon: FileText },
] as const satisfies NavigationItem[];

export const PSYCHOLOGIST_SETTINGS_ITEM = {
  href: ROUTES.psychologist.settings,
  label: "Configurações",
  icon: Settings,
} as const satisfies NavigationItem;
