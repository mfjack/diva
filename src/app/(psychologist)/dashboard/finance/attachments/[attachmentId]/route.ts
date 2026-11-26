import type { NextRequest } from "next/server";
import { serveAttachment } from "@/features/attachments/storage";

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/dashboard/finance/attachments/[attachmentId]">,
) {
  const { attachmentId } = await context.params;
  return serveAttachment({ store: "expense", attachmentId });
}
