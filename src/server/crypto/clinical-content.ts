import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { env } from "@/lib/env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH_IN_BYTES = 12;
const PAYLOAD_VERSION = "v1";
const PAYLOAD_SEPARATOR = ":";
const ENCODING = "base64";

function getEncryptionKey(): Buffer {
  return Buffer.from(env.CLINICAL_RECORDS_ENCRYPTION_KEY, ENCODING);
}

export function encryptClinicalContent(plainText: string): string {
  const initializationVector = randomBytes(IV_LENGTH_IN_BYTES);
  const cipher = createCipheriv(
    ALGORITHM,
    getEncryptionKey(),
    initializationVector,
  );
  const cipherText = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  return [
    PAYLOAD_VERSION,
    initializationVector.toString(ENCODING),
    cipher.getAuthTag().toString(ENCODING),
    cipherText.toString(ENCODING),
  ].join(PAYLOAD_SEPARATOR);
}

export function decryptClinicalContent(payload: string): string {
  const [version, initializationVector, authTag, cipherText] =
    payload.split(PAYLOAD_SEPARATOR);

  if (
    version !== PAYLOAD_VERSION ||
    !initializationVector ||
    !authTag ||
    !cipherText
  ) {
    throw new Error("Invalid clinical content payload.");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(initializationVector, ENCODING),
  );
  decipher.setAuthTag(Buffer.from(authTag, ENCODING));

  return Buffer.concat([
    decipher.update(Buffer.from(cipherText, ENCODING)),
    decipher.final(),
  ]).toString("utf8");
}
