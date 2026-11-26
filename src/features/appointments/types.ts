import type { PatientId } from "@/features/patients/types";
import type { PaymentStatus } from "@/features/payments/types";
import type { Brand } from "@/lib/brand";
import type { Cents } from "@/lib/money";
import type { Enums } from "@/lib/supabase/database.types";

export type AppointmentId = Brand<string, "AppointmentId">;

export type AppointmentSeriesId = Brand<string, "AppointmentSeriesId">;

export type AppointmentStatus = Enums<"appointment_status">;

export type AppointmentModality = Enums<"appointment_modality">;

export type CancellationActor = Enums<"cancellation_actor">;

type AppointmentCancellation = {
  cancelledAt: string;
  cancelledBy: CancellationActor;
  reason: string;
  isLateCancellation: boolean;
};

export type Appointment = {
  id: AppointmentId;
  patientId: PatientId;
  patientName: string;
  seriesId: AppointmentSeriesId | null;
  startsAt: string;
  endsAt: string;
  modality: AppointmentModality;
  status: AppointmentStatus;
  priceCents: Cents;
  paymentStatus: PaymentStatus;
  meetingUrl: string | null;
  cancellation: AppointmentCancellation | null;
};
