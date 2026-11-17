import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  addMonthsToMonthKey,
  formatMonthLabel,
  getCurrentMonthKey,
} from "@/lib/months";
import { ROUTES } from "@/lib/routes";

type MonthNavigatorProps = {
  monthKey: string;
};

function getMonthHref(monthKey: string): string {
  return monthKey === getCurrentMonthKey()
    ? ROUTES.psychologist.finance
    : `${ROUTES.psychologist.finance}?month=${monthKey}`;
}

export function MonthNavigator({ monthKey }: MonthNavigatorProps) {
  const isCurrentMonth = monthKey === getCurrentMonthKey();

  return (
    <nav aria-label="Navegar entre meses" className="flex items-center gap-2">
      {!isCurrentMonth && (
        <Button
          variant="ghost"
          size="lg"
          nativeButton={false}
          render={<Link href={ROUTES.psychologist.finance} />}
        >
          Este mês
        </Button>
      )}
      <div className="flex items-center rounded-lg border bg-card">
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Mês anterior"
          nativeButton={false}
          render={
            <Link href={getMonthHref(addMonthsToMonthKey(monthKey, -1))} />
          }
          className="rounded-r-none"
        >
          <ChevronLeft aria-hidden />
        </Button>
        <span className="min-w-36 px-2 text-center font-medium text-sm">
          {formatMonthLabel(monthKey)}
        </span>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Próximo mês"
          nativeButton={false}
          render={
            <Link href={getMonthHref(addMonthsToMonthKey(monthKey, 1))} />
          }
          className="rounded-l-none"
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>
    </nav>
  );
}
