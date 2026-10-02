import type {
  MonthlyRevenue,
  Payment,
  PaymentId,
  PaymentMethod,
} from "@/features/payments/types";
import { toDateKey } from "@/lib/dates";
import type { Cents } from "@/lib/money";
import { mockAppointments } from "./appointments";
import { getMockPatient } from "./patients";

const PAYMENT_METHODS_ROTATION = [
  "pix",
  "pix",
  "credit_card",
  "pix",
  "bank_transfer",
] as const satisfies PaymentMethod[];

const PAYMENT_DELAY_IN_MS = 2 * 60 * 60 * 1000;

const now = Date.now();

export const mockPayments: Payment[] = mockAppointments
  .filter(
    (appointment) =>
      new Date(appointment.startsAt).getTime() <= now &&
      (appointment.status === "completed" ||
        appointment.status === "no_show" ||
        appointment.cancellation?.isLateCancellation),
  )
  .map((appointment, index) => {
    const isPaid = appointment.paymentStatus === "paid";
    return {
      id: `payment-${appointment.id}` as PaymentId,
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      patientPhone: getMockPatient(appointment.patientId).phone,
      sessionStartsAt: appointment.startsAt,
      amountCents: appointment.priceCents,
      status: appointment.paymentStatus,
      method: isPaid
        ? (PAYMENT_METHODS_ROTATION[index % PAYMENT_METHODS_ROTATION.length] ??
          null)
        : null,
      dueDate: toDateKey(appointment.startsAt),
      paidAt: isPaid
        ? new Date(
            new Date(appointment.endsAt).getTime() + PAYMENT_DELAY_IN_MS,
          ).toISOString()
        : null,
      receiptNumber: isPaid ? 1000 + index : null,
    };
  })
  .reverse();

export const mockMonthlyRevenue: MonthlyRevenue[] = [
  { month: "mai", receivedCents: 1012000 as Cents, pendingCents: 0 as Cents },
  { month: "jun", receivedCents: 1146000 as Cents, pendingCents: 0 as Cents },
  { month: "jul", receivedCents: 968000 as Cents, pendingCents: 0 as Cents },
  {
    month: "ago",
    receivedCents: 1204000 as Cents,
    pendingCents: 22000 as Cents,
  },
  {
    month: "set",
    receivedCents: 1288000 as Cents,
    pendingCents: 40000 as Cents,
  },
  {
    month: "out",
    receivedCents: 412000 as Cents,
    pendingCents: 80000 as Cents,
  },
];
