import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ROUTES } from "@/lib/routes";

const AVAILABILITY_SETTINGS_HREF = `${ROUTES.psychologist.settings}?tab=availability`;

export function MissingAvailabilityNotice() {
  return (
    <Empty className="flex-1 border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CalendarClock aria-hidden />
        </EmptyMedia>
        <EmptyTitle>Configure seus horários de atendimento</EmptyTitle>
        <EmptyDescription>
          A agenda aparece assim que você definir os dias e horários em que
          atende.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          nativeButton={false}
          render={<Link href={AVAILABILITY_SETTINGS_HREF} />}
        >
          Configurar horários
        </Button>
      </EmptyContent>
    </Empty>
  );
}
