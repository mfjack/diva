import { CircleCheck, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Appointment } from "@/features/appointments/types";
import type { Patient } from "@/features/patients/types";
import {
  ChargeDialog,
  type ChargeTarget,
} from "@/features/payments/components/charge-dialog";
import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge";
import { UndoPaymentButton } from "@/features/payments/components/undo-payment-button";
import { getPaymentDueDate } from "@/features/payments/due-date";
import { isOverdue } from "@/features/payments/overdue";
import { toDateKey } from "@/lib/dates";
import { formatCurrency } from "@/lib/format";
import { DetailItem, DetailsSection } from "./details-section";

type AppointmentPaymentSectionProps = {
  appointment: Appointment;
  patient: Patient | null;
  pixKey: string | null;
  isSessionUpcoming: boolean;
  onRegisterPaymentRequest: (appointment: Appointment) => void;
};

function getChargeTarget(
  appointment: Appointment,
  patient: Patient | null,
): ChargeTarget | null {
  if (!patient?.phone) return null;
  const isPaymentOverdue = isOverdue({
    status: appointment.paymentStatus,
    dueDate: getPaymentDueDate(patient, toDateKey(appointment.startsAt)),
    sessionStartsAt: appointment.startsAt,
  });
  if (!isPaymentOverdue) return null;
  return {
    patientName: appointment.patientName,
    patientPhone: patient.phone,
    items: [
      {
        sessionStartsAt: appointment.startsAt,
        amountCents: appointment.priceCents,
      },
    ],
  };
}

export function AppointmentPaymentSection({
  appointment,
  patient,
  pixKey,
  isSessionUpcoming,
  onRegisterPaymentRequest,
}: AppointmentPaymentSectionProps) {
  const [isChargeOpen, setIsChargeOpen] = useState(false);
  const isPending = appointment.paymentStatus === "pending";
  const chargeTarget = getChargeTarget(appointment, patient);

  function handleRegisterPayment() {
    onRegisterPaymentRequest(appointment);
  }

  function handleOpenCharge() {
    setIsChargeOpen(true);
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
        {appointment.paymentStatus === "paid" && (
          <UndoPaymentButton
            payment={{
              appointmentId: appointment.id,
              patientName: appointment.patientName,
              sessionStartsAt: appointment.startsAt,
              amountCents: appointment.priceCents,
            }}
          />
        )}
      </DetailItem>
      {isPending && (
        <div className="flex flex-wrap gap-2 pt-3">
          <Button variant="outline" size="lg" onClick={handleRegisterPayment}>
            <CircleCheck aria-hidden />
            Registrar pagamento
          </Button>
          {chargeTarget && (
            <Button variant="ghost" size="lg" onClick={handleOpenCharge}>
              <MessageCircle aria-hidden />
              Cobrar no WhatsApp
            </Button>
          )}
        </div>
      )}
      <ChargeDialog
        target={isChargeOpen ? chargeTarget : null}
        pixKey={pixKey}
        onOpenChange={setIsChargeOpen}
      />
    </DetailsSection>
  );
}
