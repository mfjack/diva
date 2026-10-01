import { timestamp, uuid } from "drizzle-orm/pg-core";

export function primaryId() {
  return uuid("id").primaryKey().defaultRandom();
}

export function timestamptz(name: string) {
  return timestamp(name, { withTimezone: true });
}

export function timestamps() {
  return {
    createdAt: timestamptz("created_at").notNull().defaultNow(),
    updatedAt: timestamptz("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  };
}

export function softDelete() {
  return {
    deletedAt: timestamptz("deleted_at"),
  };
}
