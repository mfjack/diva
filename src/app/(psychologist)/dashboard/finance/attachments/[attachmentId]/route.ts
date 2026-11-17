import type { NextRequest } from "next/server";
import { getAuthorizedPsychologist } from "@/features/auth/queries";
import { readMockExpenseFile } from "@/mocks/expense-files";
import { findMockExpenseAttachment } from "@/mocks/expenses";

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
  const match = findMockExpenseAttachment(attachmentId);
  if (!match) return new Response(null, { status: 404 });

  const { attachment } = match;
  const content = await readMockExpenseFile(attachment.id);
  return new Response(Buffer.from(content), {
    headers: {
      "Content-Type": attachment.contentType,
      "Content-Length": String(content.byteLength),
      "Content-Disposition": buildContentDisposition(attachment.fileName),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy":
        "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
