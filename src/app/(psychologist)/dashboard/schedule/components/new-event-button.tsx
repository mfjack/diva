"use client";

import { CalendarPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarEventDialog } from "@/features/calendar-events/components/calendar-event-dialog";

export function NewEventButton() {
  const [isOpen, setIsOpen] = useState(false);

  function handleOpen() {
    setIsOpen(true);
  }

  return (
    <>
      <Button variant="outline" size="lg" onClick={handleOpen}>
        <CalendarPlus aria-hidden />
        Novo evento
      </Button>
      <CalendarEventDialog
        isOpen={isOpen}
        event={null}
        onOpenChange={setIsOpen}
      />
    </>
  );
}
