"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PAYMENT_ACTION_TONES = {
  primary: { variant: "outline", className: "shadow-xs" },
  subtle: { variant: "ghost", className: "text-muted-foreground" },
} as const;

type PaymentActionButtonProps = {
  icon: LucideIcon;
  label: string;
  accessibleLabel: string;
  tone?: keyof typeof PAYMENT_ACTION_TONES;
  onClick: () => void;
};

export function PaymentActionButton({
  icon: Icon,
  label,
  accessibleLabel,
  tone = "primary",
  onClick,
}: PaymentActionButtonProps) {
  const { variant, className } = PAYMENT_ACTION_TONES[tone];

  return (
    <Button
      variant={variant}
      size="sm"
      aria-label={accessibleLabel}
      className={cn(
        "h-6 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      onClick={onClick}
    >
      <Icon aria-hidden />
      {label}
    </Button>
  );
}
