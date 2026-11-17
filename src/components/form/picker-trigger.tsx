import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { FORM_INPUT_CLASS_NAME } from "./form-field-styles";

type PickerTriggerProps = Omit<ComponentProps<"button">, "children"> & {
  icon: LucideIcon;
  displayValue: string | null;
  placeholder: string;
};

export function PickerTrigger({
  icon: Icon,
  displayValue,
  placeholder,
  className,
  ...props
}: PickerTriggerProps) {
  return (
    <button
      type="button"
      className={cn(
        FORM_INPUT_CLASS_NAME,
        "flex w-full items-center justify-between gap-3 border border-transparent text-left outline-none aria-invalid:border-destructive",
        className,
      )}
      {...props}
    >
      <span
        className={cn("truncate", !displayValue && "text-muted-foreground")}
      >
        {displayValue ?? placeholder}
      </span>
      <Icon aria-hidden className="size-4.5 shrink-0 text-muted-foreground" />
    </button>
  );
}
