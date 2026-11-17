import { CircleCheck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/features/appointments/types";
import type { Patient } from "@/features/patients/types";
import { getChargeWhatsAppUrl } from "@/features/payments/charge-message";
import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge";
import { formatCurrency } from "@/lib/format";
import { DetailItem, DetailsSection } from "./details-section";

type AppointmentPaymentSectionProps = {
  appointment: Appointment;
  patient: Patient | null;
  pixKey: string | null;
  isSessionUpcoming: boolean;
  onRegisterPaymentRequest: (appointment: Appointment) => void;
};

export function AppointmentPaymentSection({
  appointment,
  patient,
  pixKey,
  isSessionUpcoming,
  onRegisterPaymentRequest,
}: AppointmentPaymentSectionProps) {
  const isPending = appointment.paymentStatus === "pending";
  const chargeUrl =
    isPending && !isSessionUpcoming
      ? getChargeWhatsAppUrl(
          {
            patientName: appointment.patientName,
            patientPhone: patient?.phone ?? null,
            amountCents: appointment.priceCents,
            sessionStartsAt: appointment.startsAt,
          },
          pixKey,
        )
      : null;

  function handleRegisterPayment() {
    onRegisterPaymentRequest(appointment);
  }

  return (
    <DetailsSection title="Pagamento">
      <DetailItem label="Valor">
        <span className="font-medium tabular-nums">
          {formatCurrency(appointment.priceCents)}
        </span>
        <PaymentStatusBadge
          status={appointment.paymentStatus}
          isSessionUpcoming={isSessionUpcoming}
        />
      </DetailItem>
      {isPending && (
        <div className="flex flex-wrap gap-2 pt-3">
          <Button variant="outline" size="lg" onClick={handleRegisterPayment}>
            <CircleCheck aria-hidden />
            Registrar pagamento
          </Button>
          {chargeUrl && (
            <Button
              variant="ghost"
              size="lg"
              nativeButton={false}
              render={
                <a href={chargeUrl} target="_blank" rel="noopener noreferrer" />
              }
            >
              <MessageCircle aria-hidden />
              Cobrar no WhatsApp
            </Button>
          )}
        </div>
      )}
    </DetailsSection>
  );
}
