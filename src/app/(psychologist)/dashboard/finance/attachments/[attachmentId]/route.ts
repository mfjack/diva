import type { NextRequest } from "next/server";
import { getAuthorizedPsychologist } from "@/features/auth/queries";
import { getExpenseAttachmentFile } from "@/features/expenses/queries";
import { EXPENSE_ATTACHMENTS_BUCKET } from "@/features/expenses/storage";
import { createClient } from "@/lib/supabase/server";

function buildContentDisposition(fileName: string): string {
  return `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/dashboard/finance/attachments/[attachmentId]">,
) {
  if (!(await getAuthorizedPsychologist())) {
    return new Response(null, { status: 401 });
  }
  const { attachmentId } = await context.params;
  const match = await getExpenseAttachmentFile(attachmentId);
  if (!match) return new Response(null, { status: 404 });

  const supabase = await createClient();
  const { data: file, error } = await supabase.storage
    .from(EXPENSE_ATTACHMENTS_BUCKET)
    .download(match.storagePath);
  if (error) return new Response(null, { status: 404 });

  const content = await file.arrayBuffer();
  return new Response(content, {
    headers: {
      "Content-Type": match.attachment.contentType,
      "Content-Length": String(content.byteLength),
      "Content-Disposition": buildContentDisposition(match.attachment.fileName),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy":
        "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
