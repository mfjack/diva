"use client";

import { CalendarX2, Check, ExternalLink, UserX } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { WhatsAppLink } from "@/components/whatsapp-link";
import { AppointmentModalityLabel } from "@/features/appointments/components/appointment-row";
import { AppointmentStatusBadge } from "@/features/appointments/components/appointment-status-badge";
import { useUpdateAppointmentStatusMutation } from "@/features/appointments/hooks/use-update-appointment-status-mutation";
import { CANCELLATION_ACTOR_LABELS } from "@/features/appointments/labels";
import type { AppointmentStatusUpdate } from "@/features/appointments/schemas";
import type { Appointment, AppointmentId } from "@/features/appointments/types";
import type { Patient } from "@/features/patients/types";
import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge";
import {
  formatCurrency,
  formatDateTime,
  formatLongDate,
  formatTime,
} from "@/lib/format";
import { ROUTES } from "@/lib/routes";

const STATUS_UPDATE_MESSAGES = {
  completed: "Sessão marcada como realizada.",
  no_show: "Falta registrada.",
} as const satisfies Record<AppointmentStatusUpdate, string>;

type AppointmentDetailsSheetProps = {
  appointment: Appointment | null;
  patient: Patient | null;
  onOpenChange: (isOpen: boolean) => void;
  onStatusUpdated: (
    appointmentId: AppointmentId,
    changes: Partial<Appointment>,
  ) => void;
  onCancelRequest: (appointment: Appointment) => void;
};

type DetailItemProps = {
  label: string;
  children: ReactNode;
};

function DetailItem({ label, children }: DetailItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

export function AppointmentDetailsSheet({
  appointment,
  patient,
  onOpenChange,
  onStatusUpdated,
  onCancelRequest,
}: AppointmentDetailsSheetProps) {
  const updateStatusMutation = useUpdateAppointmentStatusMutation();
  const isOpenForActions =
    appointment?.status === "scheduled" || appointment?.status === "confirmed";

  function handleStatusUpdate(status: AppointmentStatusUpdate) {
    if (!appointment) return;
    updateStatusMutation.mutate(
      { appointmentId: appointment.id, status },
      {
        onSuccess: () => {
          onStatusUpdated(appointment.id, { status });
          toast.success(STATUS_UPDATE_MESSAGES[status]);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <Sheet open={appointment !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        {appointment && (
          <>
            <SheetHeader className="gap-2 border-b p-6">
              <AppointmentStatusBadge status={appointment.status} />
              <SheetTitle className="font-heading font-normal text-3xl">
                {appointment.patientName}
              </SheetTitle>
              <SheetDescription className="first-letter:uppercase">
                {formatLongDate(appointment.startsAt)},{" "}
                {formatTime(appointment.startsAt)} às{" "}
                {formatTime(appointment.endsAt)}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
              <dl className="divide-y text-sm">
                <DetailItem label="Modalidade">
                  <AppointmentModalityLabel modality={appointment.modality} />
                </DetailItem>
                <DetailItem label="Valor">
                  <span className="font-medium tabular-nums">
                    {formatCurrency(appointment.priceCents)}
                  </span>
                </DetailItem>
                <DetailItem label="Pagamento">
                  <PaymentStatusBadge status={appointment.paymentStatus} />
                </DetailItem>
                {patient?.phone && (
                  <DetailItem label="Contato">
                    <WhatsAppLink phone={patient.phone} />
                  </DetailItem>
                )}
                {appointment.meetingUrl && (
                  <DetailItem label="Sala online">
                    <a
                      href={appointment.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
                    >
                      Abrir sala
                      <ExternalLink aria-hidden className="size-3.5" />
                    </a>
                  </DetailItem>
                )}
              </dl>

              {appointment.cancellation && (
                <div className="flex flex-col gap-2 rounded-lg bg-muted p-4 text-sm">
                  <span className="font-medium">
                    Cancelada{" "}
                    {
                      CANCELLATION_ACTOR_LABELS[
                        appointment.cancellation.cancelledBy
                      ]
                    }{" "}
                    em {formatDateTime(appointment.cancellation.cancelledAt)}
                  </span>
                  <p className="text-muted-foreground">
                    {appointment.cancellation.reason}
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                nativeButton={false}
                render={
                  <Link
                    href={`${ROUTES.psychologist.patients}/${appointment.patientId}`}
                  />
                }
              >
                Abrir ficha do paciente
              </Button>
            </div>

            {isOpenForActions && (
              <SheetFooter className="grid grid-cols-2 gap-3 border-t p-6">
                <Button
                  className="h-11"
                  disabled={updateStatusMutation.isPending}
                  onClick={() => handleStatusUpdate("completed")}
                >
                  {updateStatusMutation.isPending ? (
                    <Spinner aria-hidden />
                  ) : (
                    <Check aria-hidden />
                  )}
                  Realizada
                </Button>
                <Button
                  variant="outline"
                  className="h-11"
                  disabled={updateStatusMutation.isPending}
                  onClick={() => handleStatusUpdate("no_show")}
                >
                  <UserX aria-hidden />
                  Falta
                </Button>
                <Button
                  variant="ghost"
                  className="col-span-2 h-11 text-destructive hover:text-destructive"
                  onClick={() => onCancelRequest(appointment)}
                >
                  <CalendarX2 aria-hidden />
                  Cancelar sessão
                </Button>
              </SheetFooter>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
