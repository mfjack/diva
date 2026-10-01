import "server-only";

import { headers } from "next/headers";
import type { UserId } from "@/features/auth/types";
import { db } from "@/server/db";
import { type AuditLogMetadata, auditLogs } from "@/server/db/schema";

export const AUDIT_ACTIONS = [
  "clinical_record.viewed",
  "clinical_record.created",
  "clinical_record.updated",
  "clinical_record.deleted",
  "clinical_record.exported",
  "patient.viewed",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

type RecordAuditLogInput = {
  actorUserId: UserId;
  action: AuditAction;
  entityType: string;
  entityId: string | null;
  metadata?: AuditLogMetadata;
};

async function getClientIpAddress(): Promise<string | null> {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() ?? requestHeaders.get("x-real-ip");
}

export async function recordAuditLog({
  actorUserId,
  action,
  entityType,
  entityId,
  metadata,
}: RecordAuditLogInput): Promise<void> {
  await db.insert(auditLogs).values({
    actorUserId,
    action,
    entityType,
    entityId,
    metadata: metadata ?? null,
    ipAddress: await getClientIpAddress(),
  });
}
