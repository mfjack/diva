import "server-only";

import type { AuditLogEntry } from "@/features/audit/record-audit-log";
import { getMockDatabase, saveMockDatabase } from "./store";

export function insertMockAuditLog(entry: AuditLogEntry): void {
  getMockDatabase().auditLogs.push(entry);
  saveMockDatabase();
}
