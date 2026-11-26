import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint?: ReactNode;
  icon: LucideIcon;
  isHighlighted?: boolean;
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  isHighlighted = false,
}: StatCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-2 rounded-xl border p-4",
        isHighlighted
          ? "border-primary bg-primary text-primary-foreground"
          : "bg-card",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "font-medium text-sm",
            isHighlighted
              ? "text-primary-foreground/75"
              : "text-muted-foreground",
          )}
        >
          {label}
        </span>
        <Icon
          aria-hidden
          className={cn(
            "size-4",
            isHighlighted
              ? "text-primary-foreground/75"
              : "text-muted-foreground",
          )}
        />
      </div>
      <p className="font-semibold text-lg tabular-nums tracking-tight">
        {value}
      </p>
      {hint && (
        <p
          className={cn(
            "text-sm",
            isHighlighted
              ? "text-primary-foreground/75"
              : "text-muted-foreground",
          )}
        >
          {hint}
        </p>
      )}
    </article>
  );
}
