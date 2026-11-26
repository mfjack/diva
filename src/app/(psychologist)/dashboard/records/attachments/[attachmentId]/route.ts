import type { NextRequest } from "next/server";
import { serveAttachment } from "@/features/attachments/storage";
import { recordAuditLog } from "@/features/audit/record-audit-log";
import { decryptClinicalFile } from "@/features/clinical-records/content-encryption";

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/dashboard/records/attachments/[attachmentId]">,
) {
  const { attachmentId } = await context.params;
  return serveAttachment({
    store: "clinicalRecord",
    attachmentId,
    prepare: async ({ content, attachmentId: viewedId, psychologistId }) => {
      const decryptedContent = decryptClinicalFile(content);
      await recordAuditLog({
        actorUserId: psychologistId,
        action: "clinical_record_attachment.viewed",
        entityType: "clinical_record_attachment",
        entityId: viewedId,
      });
      return decryptedContent;
    },
  });
}
