import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildScheduleHref, type ScheduleView } from "../schedule-layout";

const VIEW_LABELS = {
  week: "Semana",
  month: "Mês",
} as const satisfies Record<ScheduleView, string>;

const VIEWS = Object.keys(VIEW_LABELS) as ScheduleView[];

type ScheduleViewSwitchProps = {
  view: ScheduleView;
};

export function ScheduleViewSwitch({ view }: ScheduleViewSwitchProps) {
  return (
    <nav
      aria-label="Modo de visualização"
      className="flex items-center gap-1 rounded-lg border bg-card p-1"
    >
      {VIEWS.map((option) => (
        <Button
          key={option}
          variant="ghost"
          size="sm"
          nativeButton={false}
          aria-current={option === view ? "page" : undefined}
          render={<Link href={buildScheduleHref(option, 0)} />}
          className={cn(
            "px-3",
            option === view &&
              "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
          )}
        >
          {VIEW_LABELS[option]}
        </Button>
      ))}
    </nav>
  );
}
