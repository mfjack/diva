import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  smallint,
  text,
  time,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { primaryId, timestamps, timestamptz } from "./columns";
import { appointmentModalityEnum } from "./enums";

export const availabilityRules = pgTable(
  "availability_rules",
  {
    id: primaryId(),
    psychologistId: text("psychologist_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    weekday: smallint("weekday").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    modality: appointmentModalityEnum("modality"),
    ...timestamps(),
  },
  (table) => [
    index("availability_rules_psychologist_id_idx").on(table.psychologistId),
    check(
      "availability_rules_weekday_check",
      sql`${table.weekday} between 0 and 6`,
    ),
    check(
      "availability_rules_time_range_check",
      sql`${table.endTime} > ${table.startTime}`,
    ),
  ],
);

export const availabilityBlocks = pgTable(
  "availability_blocks",
  {
    id: primaryId(),
    psychologistId: text("psychologist_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    startsAt: timestamptz("starts_at").notNull(),
    endsAt: timestamptz("ends_at").notNull(),
    reason: text("reason"),
    ...timestamps(),
  },
  (table) => [
    index("availability_blocks_psychologist_period_idx").on(
      table.psychologistId,
      table.startsAt,
    ),
    check(
      "availability_blocks_period_check",
      sql`${table.endsAt} > ${table.startsAt}`,
    ),
  ],
);
