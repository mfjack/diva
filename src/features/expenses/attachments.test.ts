import { describe, expect, it } from "vitest";
import {
  detectAttachmentType,
  formatFileSize,
  getAttachmentSizeError,
  MAX_ATTACHMENT_SIZE_BYTES,
  sanitizeAttachmentName,
} from "./attachments";

function bytesOf(...values: number[]): Uint8Array {
  return new Uint8Array(values);
}

describe("detectAttachmentType", () => {
  it("recognizes PDFs and images by their first bytes", () => {
    expect(detectAttachmentType(bytesOf(0x25, 0x50, 0x44, 0x46, 0x2d))).toBe(
      "application/pdf",
    );
    expect(detectAttachmentType(bytesOf(0xff, 0xd8, 0xff, 0xe0))).toBe(
      "image/jpeg",
    );
    expect(
      detectAttachmentType(
        bytesOf(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50),
      ),
    ).toBe("image/webp");
  });

  it("rejects anything else, even if it claims to be a PDF", () => {
    expect(detectAttachmentType(new TextEncoder().encode("<html>"))).toBeNull();
    expect(detectAttachmentType(bytesOf(0x52, 0x49, 0x46, 0x46))).toBeNull();
  });
});

describe("getAttachmentSizeError", () => {
  it("accepts files up to 5 MB", () => {
    expect(getAttachmentSizeError(MAX_ATTACHMENT_SIZE_BYTES)).toBeNull();
    expect(
      getAttachmentSizeError(MAX_ATTACHMENT_SIZE_BYTES + 1),
    ).not.toBeNull();
    expect(getAttachmentSizeError(0)).not.toBeNull();
  });
});

describe("sanitizeAttachmentName", () => {
  it("removes path and control characters", () => {
    expect(sanitizeAttachmentName("../boleto:nov.pdf")).toBe("..boletonov.pdf");
    expect(sanitizeAttachmentName("   ")).toBe("anexo");
  });
});

describe("formatFileSize", () => {
  it("formats kilobytes and megabytes", () => {
    expect(formatFileSize(2048)).toBe("2 KB");
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe("1,5 MB");
  });
});
