import { index, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { primaryId, timestamptz } from "./columns";

export type AuditLogMetadata = Record<string, string | number | boolean | null>;

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: primaryId(),
    actorUserId: text("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),
    metadata: jsonb("metadata").$type<AuditLogMetadata>(),
    ipAddress: text("ip_address"),
    createdAt: timestamptz("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("audit_logs_entity_idx").on(table.entityType, table.entityId),
    index("audit_logs_actor_idx").on(table.actorUserId, table.createdAt),
  ],
);
