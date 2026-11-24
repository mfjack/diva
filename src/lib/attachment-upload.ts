import "server-only";

import {
  type AttachmentContentType,
  detectAttachmentType,
  getAttachmentSizeError,
  MAX_ATTACHMENTS_PER_ITEM,
  sanitizeAttachmentName,
} from "./attachments";

export const ATTACHMENT_UPLOAD_MESSAGES = {
  invalidFile: "Escolha um arquivo para anexar.",
  tooMany: `Você pode anexar até ${MAX_ATTACHMENTS_PER_ITEM} arquivos.`,
  unsupported: "Envie um PDF ou uma imagem (JPG, PNG ou WEBP).",
  uploadFailed: "Não foi possível enviar o anexo. Tente novamente.",
  notFound: "Esse anexo não existe mais. Atualize a tela.",
} as const;

export type AttachmentUpload =
  | {
      isValid: true;
      fileName: string;
      contentType: AttachmentContentType;
      sizeBytes: number;
      content: Uint8Array;
    }
  | { isValid: false; message: string };

export async function readAttachmentUpload(
  formData: FormData,
  currentAttachmentCount: number,
): Promise<AttachmentUpload> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { isValid: false, message: ATTACHMENT_UPLOAD_MESSAGES.invalidFile };
  }
  if (currentAttachmentCount >= MAX_ATTACHMENTS_PER_ITEM) {
    return { isValid: false, message: ATTACHMENT_UPLOAD_MESSAGES.tooMany };
  }
  const sizeError = getAttachmentSizeError(file.size);
  if (sizeError) return { isValid: false, message: sizeError };

  const content = new Uint8Array(await file.arrayBuffer());
  const contentType = detectAttachmentType(content);
  if (!contentType) {
    return { isValid: false, message: ATTACHMENT_UPLOAD_MESSAGES.unsupported };
  }
  return {
    isValid: true,
    fileName: sanitizeAttachmentName(file.name),
    contentType,
    sizeBytes: file.size,
    content,
  };
}

export function buildAttachmentResponse(
  content: ArrayBuffer | Uint8Array,
  { fileName, contentType }: { fileName: string; contentType: string },
): Response {
  const body =
    content instanceof ArrayBuffer
      ? new Uint8Array(content)
      : Uint8Array.from(content);
  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(body.byteLength),
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy":
        "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  });
}
