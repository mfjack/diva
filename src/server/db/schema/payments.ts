import { date, index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { appointments } from "./appointments";
import { users } from "./auth";
import { primaryId, timestamps, timestamptz } from "./columns";
import { paymentMethodEnum, paymentStatusEnum } from "./enums";
import { patients } from "./patients";

export const payments = pgTable(
  "payments",
  {
    id: primaryId(),
    psychologistId: text("psychologist_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "restrict" }),
    appointmentId: uuid("appointment_id")
      .notNull()
      .unique()
      .references(() => appointments.id, { onDelete: "restrict" }),
    amountCents: integer("amount_cents").notNull(),
    status: paymentStatusEnum("status").notNull().default("pending"),
    method: paymentMethodEnum("method"),
    dueDate: date("due_date").notNull(),
    paidAt: timestamptz("paid_at"),
    gatewayChargeId: text("gateway_charge_id").unique(),
    receiptNumber: integer("receipt_number"),
    notes: text("notes"),
    ...timestamps(),
  },
  (table) => [
    index("payments_psychologist_status_due_idx").on(
      table.psychologistId,
      table.status,
      table.dueDate,
    ),
    index("payments_patient_idx").on(table.patientId),
  ],
);

export const processedWebhookEvents = pgTable("processed_webhook_events", {
  eventId: text("event_id").primaryKey(),
  provider: text("provider").notNull(),
  processedAt: timestamptz("processed_at").notNull().defaultNow(),
});
