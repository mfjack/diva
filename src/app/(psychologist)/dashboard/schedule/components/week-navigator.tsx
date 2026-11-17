import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

type WeekNavigatorProps = {
  weekOffset: number;
};

function getWeekHref(weekOffset: number): string {
  return weekOffset === 0
    ? ROUTES.psychologist.schedule
    : `${ROUTES.psychologist.schedule}?week=${weekOffset}`;
}

export function WeekNavigator({ weekOffset }: WeekNavigatorProps) {
  return (
    <nav aria-label="Navegar entre semanas" className="flex items-center gap-2">
      {weekOffset !== 0 && (
        <Button
          variant="ghost"
          size="lg"
          nativeButton={false}
          render={<Link href={getWeekHref(0)} />}
        >
          Hoje
        </Button>
      )}
      <div className="flex items-center rounded-lg border bg-card">
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Semana anterior"
          nativeButton={false}
          render={<Link href={getWeekHref(weekOffset - 1)} />}
          className="rounded-r-none"
        >
          <ChevronLeft aria-hidden />
        </Button>
        <span aria-hidden className="h-5 w-px bg-border" />
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Próxima semana"
          nativeButton={false}
          render={<Link href={getWeekHref(weekOffset + 1)} />}
          className="rounded-l-none"
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>
    </nav>
  );
}
