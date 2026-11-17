import "server-only";

import type { UserId } from "@/features/auth/types";
import { insertMockAuditLog } from "@/mocks/audit-logs";

export type AuditAction =
  | "clinical_record.viewed"
  | "clinical_record.created"
  | "clinical_record.updated";

export type AuditLogEntry = {
  id: string;
  actorUserId: UserId;
  action: AuditAction;
  entityType: string;
  entityId: string | null;
  createdAt: string;
};

type RecordAuditLogInput = Pick<
  AuditLogEntry,
  "actorUserId" | "action" | "entityType" | "entityId"
>;

export async function recordAuditLog(
  input: RecordAuditLogInput,
): Promise<void> {
  insertMockAuditLog({
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
}
