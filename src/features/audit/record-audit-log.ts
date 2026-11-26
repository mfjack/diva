import "server-only";

import type { UserId } from "@/features/auth/types";
import { createClient } from "@/lib/supabase/server";

type AuditAction =
  | "clinical_record.viewed"
  | "clinical_record.created"
  | "clinical_record.updated"
  | "clinical_record_attachment.uploaded"
  | "clinical_record_attachment.viewed"
  | "clinical_record_attachment.deleted";

type RecordAuditLogInput = {
  actorUserId: UserId;
  action: AuditAction;
  entityType: string;
  entityId: string | null;
};

export async function recordAuditLog({
  actorUserId,
  action,
  entityType,
  entityId,
}: RecordAuditLogInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("audit_logs").insert({
    actor_user_id: actorUserId,
    action,
    entity_type: entityType,
    entity_id: entityId,
  });
  if (error) throw new Error("Não foi possível registrar a auditoria.");
}
