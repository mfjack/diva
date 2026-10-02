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
      <Button
        variant="outline"
        size="icon"
        aria-label="Semana anterior"
        nativeButton={false}
        render={<Link href={getWeekHref(weekOffset - 1)} />}
      >
        <ChevronLeft aria-hidden />
      </Button>
      <Button
        variant="outline"
        disabled={weekOffset === 0}
        nativeButton={false}
        render={<Link href={getWeekHref(0)} />}
      >
        Esta semana
      </Button>
      <Button
        variant="outline"
        size="icon"
        aria-label="Próxima semana"
        nativeButton={false}
        render={<Link href={getWeekHref(weekOffset + 1)} />}
      >
        <ChevronRight aria-hidden />
      </Button>
    </nav>
  );
}
