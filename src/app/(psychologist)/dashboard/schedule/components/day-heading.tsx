import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { zonedDateTime } from "@/lib/dates";
import { getHoliday } from "@/lib/holidays";
import { cn } from "@/lib/utils";

export function getDayLabel(dateKey: string): string {
  const label = format(zonedDateTime(dateKey, "12:00"), "EEEE, d 'de' MMMM", {
    locale: ptBR,
  });
  const holiday = getHoliday(dateKey);
  return holiday ? `${label}, feriado de ${holiday.name}` : label;
}

type DayHeadingProps = {
  dateKey: string;
  isToday: boolean;
};

export function DayHeading({ dateKey, isToday }: DayHeadingProps) {
  const day = zonedDateTime(dateKey, "12:00");
  const holiday = getHoliday(dateKey);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="text-muted-foreground text-xs uppercase tracking-wide">
        {format(day, "EEEEEE", { locale: ptBR })}
      </span>
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full font-semibold text-sm",
          isToday && "bg-primary text-primary-foreground",
        )}
      >
        {format(day, "d")}
      </span>
      {holiday && (
        <span
          title={`${holiday.name} · ${holiday.isOptional ? "Ponto facultativo" : "Feriado nacional"}`}
          className="min-w-0 truncate text-[0.625rem] text-warning"
        >
          {holiday.name}
        </span>
      )}
    </div>
  );
}
