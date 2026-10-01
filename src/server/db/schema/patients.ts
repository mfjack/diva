import { sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { primaryId, softDelete, timestamps } from "./columns";
import { patientStatusEnum } from "./enums";

export const patients = pgTable(
  "patients",
  {
    id: primaryId(),
    psychologistId: text("psychologist_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    fullName: text("full_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    birthDate: date("birth_date"),
    cpf: text("cpf"),
    sessionPriceCents: integer("session_price_cents"),
    status: patientStatusEnum("status").notNull().default("active"),
    emergencyContactName: text("emergency_contact_name"),
    emergencyContactPhone: text("emergency_contact_phone"),
    healthInsurance: text("health_insurance"),
    notes: text("notes"),
    ...timestamps(),
    ...softDelete(),
  },
  (table) => [
    index("patients_psychologist_id_idx").on(table.psychologistId),
    uniqueIndex("patients_psychologist_user_unique")
      .on(table.psychologistId, table.userId)
      .where(sql`${table.userId} is not null and ${table.deletedAt} is null`),
  ],
);
