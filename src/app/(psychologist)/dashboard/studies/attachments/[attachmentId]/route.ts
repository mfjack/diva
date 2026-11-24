import type { NextRequest } from "next/server";
import { getAuthorizedPsychologist } from "@/features/auth/queries";
import { getStudyNoteAttachmentFile } from "@/features/studies/queries";
import { STUDY_NOTE_ATTACHMENTS_BUCKET } from "@/features/studies/storage";
import { buildAttachmentResponse } from "@/lib/attachment-upload";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/dashboard/studies/attachments/[attachmentId]">,
) {
  if (!(await getAuthorizedPsychologist())) {
    return new Response(null, { status: 401 });
  }
  const { attachmentId } = await context.params;
  const match = await getStudyNoteAttachmentFile(attachmentId);
  if (!match) return new Response(null, { status: 404 });

  const supabase = await createClient();
  const { data: file, error } = await supabase.storage
    .from(STUDY_NOTE_ATTACHMENTS_BUCKET)
    .download(match.storagePath);
  if (error) return new Response(null, { status: 404 });

  return buildAttachmentResponse(await file.arrayBuffer(), match.attachment);
}
