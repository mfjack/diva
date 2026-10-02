import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex h-6 w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 font-medium text-xs",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-muted-foreground",
        info: "bg-primary/8 text-primary",
        success: "bg-success/12 text-success",
        warning: "bg-warning/14 text-warning",
        destructive: "bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export type StatusTone = NonNullable<
  VariantProps<typeof statusBadgeVariants>["tone"]
>;

type StatusBadgeProps = {
  tone: StatusTone;
  children: ReactNode;
  className?: string;
};

export function StatusBadge({ tone, children, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ tone }), className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
