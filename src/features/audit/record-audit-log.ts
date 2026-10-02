import "server-only";

import type { UserId } from "@/features/auth/types";
import type { Json } from "@/lib/supabase/database.types";
import type { SupabaseServerClient } from "@/lib/supabase/server";

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
  metadata?: Json;
};

export async function recordAuditLog(
  supabase: SupabaseServerClient,
  { actorUserId, action, entityType, entityId, metadata }: RecordAuditLogInput,
): Promise<boolean> {
  const { error } = await supabase.from("audit_logs").insert({
    actor_user_id: actorUserId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata: metadata ?? null,
  });
  return !error;
}
