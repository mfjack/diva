import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { timestamps } from "./columns";

export const psychologistProfiles = pgTable("psychologist_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  professionalRegistration: text("professional_registration").notNull(),
  bio: text("bio"),
  sessionDurationMinutes: integer("session_duration_minutes")
    .notNull()
    .default(50),
  defaultSessionPriceCents: integer("default_session_price_cents")
    .notNull()
    .default(0),
  cancellationNoticeHours: integer("cancellation_notice_hours")
    .notNull()
    .default(24),
  bookingWindowDays: integer("booking_window_days").notNull().default(30),
  pixKey: text("pix_key"),
  officeAddress: text("office_address"),
  ...timestamps(),
});
