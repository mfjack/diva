"use client";

import { Copy, ExternalLink, MessageCircle, Pencil } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { WhatsAppLink } from "@/components/whatsapp-link";
import { AppointmentModalityLabel } from "@/features/appointments/components/appointment-modality-label";
import { AppointmentStatusBadge } from "@/features/appointments/components/appointment-status-badge";
import { MeetingLinkDialog } from "@/features/appointments/components/meeting-link-dialog";
import { CANCELLATION_ACTOR_LABELS } from "@/features/appointments/labels";
import {
  buildMeetingLinkMessage,
  resolveMeetingUrl,
} from "@/features/appointments/meeting-link";
import { hasStarted } from "@/features/appointments/status-transitions";
import type { Appointment } from "@/features/appointments/types";
import type { SessionNoteSummary } from "@/features/clinical-records/types";
import type { Patient } from "@/features/patients/types";
import { formatDateTime, formatLongDate, formatTime } from "@/lib/format";
import { getInitials } from "@/lib/get-initials";
import { ROUTES } from "@/lib/routes";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { AppointmentActions } from "./appointment-actions";
import { AppointmentPaymentSection } from "./appointment-payment-section";
import { AppointmentRecordSection } from "./appointment-record-section";
import { DetailItem, DetailsSection } from "./details-section";

type AppointmentDetailsSheetProps = {
  appointment: Appointment | null;
  patient: Patient | null;
  sessionNote: SessionNoteSummary | null;
  pixKey: string | null;
  practiceMeetingUrl: string | null;
  now: string;
  onOpenChange: (isOpen: boolean) => void;
  onCancelRequest: (appointment: Appointment) => void;
  onRescheduleRequest: (appointment: Appointment) => void;
  onRegisterPaymentRequest: (appointment: Appointment) => void;
};

export function AppointmentDetailsSheet({
  appointment,
  patient,
  sessionNote,
  pixKey,
  practiceMeetingUrl,
  now,
  onOpenChange,
  onCancelRequest,
  onRescheduleRequest,
  onRegisterPaymentRequest,
}: AppointmentDetailsSheetProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [isMeetingLinkOpen, setIsMeetingLinkOpen] = useState(false);
  const nowInMs = new Date(now).getTime();
  const meetingUrl = appointment
    ? resolveMeetingUrl(appointment, practiceMeetingUrl)
    : null;
  const meetingLinkWhatsAppUrl =
    appointment && meetingUrl && patient?.phone
      ? getWhatsAppUrl(
          patient.phone,
          buildMeetingLinkMessage(appointment, meetingUrl),
        )
      : null;

  async function handleCopyMeetingUrl() {
    if (!meetingUrl) return;
    await navigator.clipboard.writeText(meetingUrl);
    toast.success("Link da sala copiado.");
  }

  function handleEditMeetingLink() {
    setIsMeetingLinkOpen(true);
  }

  function handleMeetingLinkOpenChange(isOpen: boolean) {
    setIsMeetingLinkOpen(isOpen);
  }

  return (
    <Sheet open={appointment !== null} onOpenChange={onOpenChange}>
      <SheetContent
        initialFocus={titleRef}
        className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md"
      >
        {appointment && (
          <>
            <SheetHeader className="gap-4 border-b p-6">
              <AppointmentStatusBadge status={appointment.status} />
              <div className="flex items-center gap-3">
                <Avatar className="size-11">
                  <AvatarFallback className="bg-accent font-medium text-accent-foreground">
                    {getInitials(appointment.patientName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <SheetTitle
                    ref={titleRef}
                    tabIndex={-1}
                    className="truncate font-heading font-semibold text-xl tracking-tight outline-none"
                  >
                    {appointment.patientName}
                  </SheetTitle>
                  <Link
                    href={`${ROUTES.psychologist.patients}/${appointment.patientId}`}
                    className="w-fit text-primary text-sm underline-offset-4 hover:underline"
                  >
                    Ver ficha
                  </Link>
                </div>
              </div>
              <SheetDescription className="first-letter:uppercase">
                {formatLongDate(appointment.startsAt)},{" "}
                {formatTime(appointment.startsAt)} às{" "}
                {formatTime(appointment.endsAt)}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
              <DetailsSection title="Sessão">
                <DetailItem label="Modalidade">
                  <AppointmentModalityLabel modality={appointment.modality} />
                </DetailItem>
                {appointment.modality === "online" && (
                  <DetailItem label="Sala online">
                    {meetingUrl ? (
                      <>
                        <a
                          href={meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                        >
                          Abrir
                          <ExternalLink aria-hidden className="size-3.5" />
                        </a>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Copiar link da sala"
                          onClick={handleCopyMeetingUrl}
                        >
                          <Copy aria-hidden />
                        </Button>
                        {meetingLinkWhatsAppUrl && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Enviar link da sala pelo WhatsApp"
                            nativeButton={false}
                            render={
                              <a
                                href={meetingLinkWhatsAppUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              />
                            }
                          >
                            <MessageCircle aria-hidden />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Trocar o link desta sessão"
                          onClick={handleEditMeetingLink}
                        >
                          <Pencil aria-hidden />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto px-0"
                        onClick={handleEditMeetingLink}
                      >
                        Adicionar link
                      </Button>
                    )}
                  </DetailItem>
                )}
                {patient?.phone && (
                  <DetailItem label="Contato">
                    <WhatsAppLink phone={patient.phone} />
                  </DetailItem>
                )}
              </DetailsSection>

              <AppointmentPaymentSection
                appointment={appointment}
                patient={patient}
                pixKey={pixKey}
                isSessionUpcoming={!hasStarted(appointment.startsAt, nowInMs)}
                onRegisterPaymentRequest={onRegisterPaymentRequest}
              />

              <AppointmentRecordSection
                appointment={appointment}
                sessionNote={sessionNote}
              />

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
            </div>

            <AppointmentActions
              appointment={appointment}
              now={nowInMs}
              onCancelRequest={onCancelRequest}
              onRescheduleRequest={onRescheduleRequest}
            />
          </>
        )}
      </SheetContent>
      <MeetingLinkDialog
        appointment={isMeetingLinkOpen ? appointment : null}
        onOpenChange={handleMeetingLinkOpenChange}
      />
    </Sheet>
  );
}
