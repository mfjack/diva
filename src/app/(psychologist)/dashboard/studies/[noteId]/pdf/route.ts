import type { NextRequest } from "next/server";
import { getAuthorizedPsychologist } from "@/features/auth/queries";
import { renderStudyNotePdf } from "@/features/studies/pdf/study-note-document";
import { getStudyNote } from "@/features/studies/queries";
import { toFileSlug } from "@/lib/strings";

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/dashboard/studies/[noteId]/pdf">,
) {
  if (!(await getAuthorizedPsychologist())) {
    return new Response(null, { status: 401 });
  }
  const { noteId } = await context.params;
  const note = await getStudyNote(noteId);
  if (!note) return new Response(null, { status: 404 });

  const pdf = await renderStudyNotePdf(note);
  const fileName = `${toFileSlug(note.title, "anotacao")}.pdf`;
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(pdf.byteLength),
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
