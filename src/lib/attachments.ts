export const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_ITEM = 5;
const MAX_ATTACHMENT_NAME_LENGTH = 120;

const ATTACHMENT_CONTENT_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export type AttachmentContentType = (typeof ATTACHMENT_CONTENT_TYPES)[number];

export const ATTACHMENT_ACCEPT = ATTACHMENT_CONTENT_TYPES.join(",");

export type Attachment = {
  id: string;
  fileName: string;
  contentType: AttachmentContentType;
  sizeBytes: number;
  uploadedAt: string;
};

export function isAttachmentContentType(
  value: string,
): value is AttachmentContentType {
  return ATTACHMENT_CONTENT_TYPES.some((contentType) => contentType === value);
}

const BYTES_PER_KILOBYTE = 1024;

type FileSignature = {
  contentType: AttachmentContentType;
  offset: number;
  bytes: readonly number[];
};

const FILE_SIGNATURES: readonly FileSignature[][] = [
  [
    {
      contentType: "application/pdf",
      offset: 0,
      bytes: [0x25, 0x50, 0x44, 0x46, 0x2d],
    },
  ],
  [
    {
      contentType: "image/png",
      offset: 0,
      bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    },
  ],
  [{ contentType: "image/jpeg", offset: 0, bytes: [0xff, 0xd8, 0xff] }],
  [
    { contentType: "image/webp", offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] },
    { contentType: "image/webp", offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
  ],
];

function matchesSignature(
  content: Uint8Array,
  { offset, bytes }: FileSignature,
): boolean {
  return bytes.every((byte, index) => content[offset + index] === byte);
}

export function detectAttachmentType(
  content: Uint8Array,
): AttachmentContentType | null {
  const match = FILE_SIGNATURES.find((signatures) =>
    signatures.every((signature) => matchesSignature(content, signature)),
  );
  return match?.[0]?.contentType ?? null;
}

export function getAttachmentSizeError(sizeBytes: number): string | null {
  if (sizeBytes === 0) return "O arquivo está vazio.";
  if (sizeBytes > MAX_ATTACHMENT_SIZE_BYTES) {
    return "Envie arquivos de até 5 MB.";
  }
  return null;
}

const FORBIDDEN_NAME_CHARACTERS = new Set([
  "\\",
  "/",
  ":",
  "*",
  "?",
  '"',
  "<",
  ">",
  "|",
]);
const FIRST_PRINTABLE_CHAR_CODE = 32;

function isAllowedNameCharacter(character: string): boolean {
  return (
    character.charCodeAt(0) >= FIRST_PRINTABLE_CHAR_CODE &&
    !FORBIDDEN_NAME_CHARACTERS.has(character)
  );
}

export function sanitizeAttachmentName(fileName: string): string {
  const cleanName = [...fileName]
    .filter(isAllowedNameCharacter)
    .join("")
    .trim();
  return (cleanName || "anexo").slice(-MAX_ATTACHMENT_NAME_LENGTH);
}

export function formatFileSize(sizeBytes: number): string {
  const kilobytes = sizeBytes / BYTES_PER_KILOBYTE;
  if (kilobytes < BYTES_PER_KILOBYTE)
    return `${Math.max(1, Math.round(kilobytes))} KB`;
  return `${(kilobytes / BYTES_PER_KILOBYTE).toFixed(1).replace(".", ",")} MB`;
}
