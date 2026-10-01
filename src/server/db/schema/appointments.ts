import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { primaryId, timestamps, timestamptz } from "./columns";
import {
  appointmentModalityEnum,
  appointmentStatusEnum,
  cancellationActorEnum,
} from "./enums";
import { patients } from "./patients";

export const appointments = pgTable(
  "appointments",
  {
    id: primaryId(),
    psychologistId: text("psychologist_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "restrict" }),
    startsAt: timestamptz("starts_at").notNull(),
    endsAt: timestamptz("ends_at").notNull(),
    modality: appointmentModalityEnum("modality").notNull(),
    status: appointmentStatusEnum("status").notNull().default("scheduled"),
    priceCents: integer("price_cents").notNull(),
    meetingUrl: text("meeting_url"),
    rescheduledFromId: uuid("rescheduled_from_id"),
    cancelledAt: timestamptz("cancelled_at"),
    cancelledBy: cancellationActorEnum("cancelled_by"),
    cancellationReason: text("cancellation_reason"),
    isLateCancellation: boolean("is_late_cancellation")
      .notNull()
      .default(false),
    ...timestamps(),
  },
  (table) => [
    index("appointments_psychologist_starts_at_idx").on(
      table.psychologistId,
      table.startsAt,
    ),
    index("appointments_patient_starts_at_idx").on(
      table.patientId,
      table.startsAt,
    ),
    check(
      "appointments_period_check",
      sql`${table.endsAt} > ${table.startsAt}`,
    ),
    check(
      "appointments_cancellation_check",
      sql`(${table.status} = 'cancelled') = (${table.cancelledAt} is not null and ${table.cancellationReason} is not null)`,
    ),
  ],
);
