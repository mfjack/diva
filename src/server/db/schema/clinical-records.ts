import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { appointments } from "./appointments";
import { users } from "./auth";
import { primaryId, softDelete, timestamps } from "./columns";
import { clinicalRecordKindEnum } from "./enums";
import { patients } from "./patients";

export const clinicalRecords = pgTable(
  "clinical_records",
  {
    id: primaryId(),
    psychologistId: text("psychologist_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "restrict" }),
    appointmentId: uuid("appointment_id").references(() => appointments.id, {
      onDelete: "set null",
    }),
    kind: clinicalRecordKindEnum("kind").notNull(),
    title: text("title").notNull(),
    encryptedContent: text("encrypted_content").notNull(),
    ...timestamps(),
    ...softDelete(),
  },
  (table) => [
    index("clinical_records_patient_idx").on(
      table.psychologistId,
      table.patientId,
    ),
  ],
);

export const documentTemplates = pgTable(
  "document_templates",
  {
    id: primaryId(),
    psychologistId: text("psychologist_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: clinicalRecordKindEnum("kind").notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    ...timestamps(),
  },
  (table) => [
    index("document_templates_psychologist_idx").on(table.psychologistId),
  ],
);
