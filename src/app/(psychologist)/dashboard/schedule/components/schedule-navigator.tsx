import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buildScheduleHref, type ScheduleView } from "../schedule-layout";

const NAVIGATION_LABELS = {
  week: {
    navigation: "Navegar entre semanas",
    previous: "Semana anterior",
    next: "Próxima semana",
  },
  month: {
    navigation: "Navegar entre meses",
    previous: "Mês anterior",
    next: "Próximo mês",
  },
} as const satisfies Record<
  ScheduleView,
  { navigation: string; previous: string; next: string }
>;

type ScheduleNavigatorProps = {
  view: ScheduleView;
  offset: number;
};

export function ScheduleNavigator({ view, offset }: ScheduleNavigatorProps) {
  const labels = NAVIGATION_LABELS[view];

  return (
    <nav aria-label={labels.navigation} className="flex items-center gap-2">
      {offset !== 0 && (
        <Button
          variant="ghost"
          size="lg"
          nativeButton={false}
          render={<Link href={buildScheduleHref(view, 0)} />}
        >
          Hoje
        </Button>
      )}
      <div className="flex items-center rounded-lg border bg-card">
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label={labels.previous}
          nativeButton={false}
          render={<Link href={buildScheduleHref(view, offset - 1)} />}
          className="rounded-r-none"
        >
          <ChevronLeft aria-hidden />
        </Button>
        <span aria-hidden className="h-5 w-px bg-border" />
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label={labels.next}
          nativeButton={false}
          render={<Link href={buildScheduleHref(view, offset + 1)} />}
          className="rounded-l-none"
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>
    </nav>
  );
}
