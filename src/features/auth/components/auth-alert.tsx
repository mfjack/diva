import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type AuthAlertProps = {
  children: ReactNode;
};

export function AuthAlert({ children }: AuthAlertProps) {
  return (
    <Alert
      variant="destructive"
      role="alert"
      className="rounded-lg border-0 bg-destructive/8 px-3.5 py-3"
    >
      <CircleAlert aria-hidden />
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
