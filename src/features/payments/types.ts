import type { AppointmentId } from "@/features/appointments/types";
import type { PatientId } from "@/features/patients/types";
import type { Brand } from "@/lib/brand";
import type { Cents } from "@/lib/money";
import type { Enums } from "@/lib/supabase/database.types";

export type PaymentId = Brand<string, "PaymentId">;

export type PaymentStatus = Enums<"payment_status">;

export type PaymentMethod = Enums<"payment_method">;

export type Payment = {
  id: PaymentId;
  appointmentId: AppointmentId;
  patientId: PatientId;
  patientName: string;
  patientPhone: string | null;
  sessionStartsAt: string;
  amountCents: Cents;
  status: PaymentStatus;
  method: PaymentMethod | null;
  dueDate: string;
  paidAt: string | null;
  receiptNumber: number | null;
};

export type MonthlyRevenue = {
  month: string;
  receivedCents: Cents;
  pendingCents: Cents;
};
