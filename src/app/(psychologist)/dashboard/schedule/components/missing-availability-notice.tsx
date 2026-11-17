import { Clock } from "lucide-react";
import Link from "next/link";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

const AVAILABILITY_SETTINGS_HREF = `${ROUTES.psychologist.settings}?tab=availability`;

export function MissingAvailabilityNotice() {
  return (
    <Alert>
      <Clock aria-hidden />
      <AlertTitle>Configure seus horários de atendimento</AlertTitle>
      <AlertDescription>
        Os horários definem os dias da agenda e as opções na hora de agendar uma
        sessão.
      </AlertDescription>
      <AlertAction>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href={AVAILABILITY_SETTINGS_HREF} />}
        >
          Configurar horários
        </Button>
      </AlertAction>
    </Alert>
  );
}
