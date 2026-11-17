import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Section({
  title,
  description,
  action,
  className,
  children,
}: SectionProps) {
  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-semibold text-base">{title}</h2>
          {description && (
            <p className="text-muted-foreground text-xs">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
