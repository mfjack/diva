import type { AppointmentId } from "@/features/appointments/types";
import type { PatientId } from "@/features/patients/types";
import type { Attachment } from "@/lib/attachments";
import type { Brand } from "@/lib/brand";

export type ClinicalRecordId = Brand<string, "ClinicalRecordId">;

export type ClinicalRecordAttachmentId = Brand<
  string,
  "ClinicalRecordAttachmentId"
>;

export type ClinicalRecordAttachment = Attachment & {
  id: ClinicalRecordAttachmentId;
};

export type ClinicalRecord = {
  id: ClinicalRecordId;
  patientId: PatientId;
  patientName: string;
  appointmentId: AppointmentId | null;
  sessionStartsAt: string | null;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  attachments: ClinicalRecordAttachment[];
};

export type ClinicalRecordSummary = Omit<
  ClinicalRecord,
  "content" | "attachments"
>;

export type SessionNoteSummary = Pick<
  ClinicalRecord,
  "id" | "patientId" | "appointmentId" | "createdAt"
>;

export type SessionOption = {
  appointmentId: AppointmentId;
  startsAt: string;
};
