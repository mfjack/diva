import "server-only";

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const ATTACHMENTS_DIRECTORY = path.join(
  process.cwd(),
  ".data",
  "uploads",
  "expense-attachments",
);

const ATTACHMENT_ID_PATTERN = /^[0-9a-f-]{36}$/;

function getAttachmentPath(attachmentId: string): string {
  if (!ATTACHMENT_ID_PATTERN.test(attachmentId)) {
    throw new Error("Invalid attachment id.");
  }
  return path.join(ATTACHMENTS_DIRECTORY, attachmentId);
}

export async function writeMockExpenseFile(
  attachmentId: string,
  content: Uint8Array,
): Promise<void> {
  await mkdir(ATTACHMENTS_DIRECTORY, { recursive: true });
  await writeFile(getAttachmentPath(attachmentId), content);
}

export async function readMockExpenseFile(
  attachmentId: string,
): Promise<Uint8Array> {
  return readFile(getAttachmentPath(attachmentId));
}

export async function deleteMockExpenseFile(
  attachmentId: string,
): Promise<void> {
  await rm(getAttachmentPath(attachmentId), { force: true });
}
