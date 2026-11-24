import type { NextRequest } from "next/server";
import { recordAuditLog } from "@/features/audit/record-audit-log";
import { getAuthorizedPsychologist } from "@/features/auth/queries";
import { decryptClinicalFile } from "@/features/clinical-records/content-encryption";
import { getClinicalRecordAttachmentFile } from "@/features/clinical-records/queries";
import { CLINICAL_RECORD_ATTACHMENTS_BUCKET } from "@/features/clinical-records/storage";
import { buildAttachmentResponse } from "@/lib/attachment-upload";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/dashboard/records/attachments/[attachmentId]">,
) {
  const psychologist = await getAuthorizedPsychologist();
  if (!psychologist) return new Response(null, { status: 401 });
  const { attachmentId } = await context.params;
  const match = await getClinicalRecordAttachmentFile(attachmentId);
  if (!match) return new Response(null, { status: 404 });

  const supabase = await createClient();
  const { data: file, error } = await supabase.storage
    .from(CLINICAL_RECORD_ATTACHMENTS_BUCKET)
    .download(match.storagePath);
  if (error) return new Response(null, { status: 404 });

  const content = decryptClinicalFile(new Uint8Array(await file.arrayBuffer()));
  await recordAuditLog({
    actorUserId: psychologist.id,
    action: "clinical_record_attachment.viewed",
    entityType: "clinical_record_attachment",
    entityId: match.attachment.id,
  });
  return buildAttachmentResponse(content, match.attachment);
}
