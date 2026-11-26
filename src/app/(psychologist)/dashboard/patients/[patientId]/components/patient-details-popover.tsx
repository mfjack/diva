"use client";

import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type PatientDetailsPopoverProps = {
  children: ReactNode;
};

export function PatientDetailsPopover({
  children,
}: PatientDetailsPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Ver dados do paciente"
            className="text-muted-foreground"
          />
        }
      >
        <Info aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 gap-4 p-4">
        {children}
      </PopoverContent>
    </Popover>
  );
}
