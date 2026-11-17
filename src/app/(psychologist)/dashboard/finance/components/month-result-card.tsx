import { Scale } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { Cents } from "@/lib/money";
import { cn } from "@/lib/utils";

type ResultBarProps = {
  label: string;
  amountCents: Cents;
  maxCents: number;
  className: string;
};

function ResultBar({
  label,
  amountCents,
  maxCents,
  className,
}: ResultBarProps) {
  const widthPercent = maxCents > 0 ? (amountCents / maxCents) * 100 : 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-muted-foreground text-xs">
        <span>{label}</span>
        <span className="tabular-nums">{formatCurrency(amountCents)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", className)}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    </div>
  );
}

type MonthResultCardProps = {
  incomeCents: Cents;
  outcomeCents: Cents;
};

export function MonthResultCard({
  incomeCents,
  outcomeCents,
}: MonthResultCardProps) {
  const resultCents = (incomeCents - outcomeCents) as Cents;
  const maxCents = Math.max(incomeCents, outcomeCents);

  return (
    <article className="flex flex-col gap-2 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-muted-foreground text-xs">
          Resultado do mês
        </span>
        <Scale aria-hidden className="size-4 text-muted-foreground" />
      </div>
      <p
        className={cn(
          "font-semibold text-xl tabular-nums tracking-tight",
          resultCents < 0 && "text-destructive",
        )}
      >
        {formatCurrency(resultCents)}
      </p>
      <div className="flex flex-col gap-2">
        <ResultBar
          label="Entrou"
          amountCents={incomeCents}
          maxCents={maxCents}
          className="bg-success"
        />
        <ResultBar
          label="Saiu"
          amountCents={outcomeCents}
          maxCents={maxCents}
          className="bg-destructive"
        />
      </div>
    </article>
  );
}
