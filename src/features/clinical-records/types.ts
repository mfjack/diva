import type { PatientId } from "@/features/patients/types";
import type { Brand } from "@/lib/brand";
import type { Enums } from "@/lib/supabase/database.types";

export type ClinicalRecordId = Brand<string, "ClinicalRecordId">;

export type DocumentTemplateId = Brand<string, "DocumentTemplateId">;

export type ClinicalRecordKind = Enums<"clinical_record_kind">;

export type ClinicalRecord = {
  id: ClinicalRecordId;
  patientId: PatientId;
  patientName: string;
  kind: ClinicalRecordKind;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type DocumentTemplate = {
  id: DocumentTemplateId;
  kind: ClinicalRecordKind;
  title: string;
  content: string;
};
