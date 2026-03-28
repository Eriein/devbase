import { describe, it, expect } from "vitest";
import {
  validateImageFile,
  validateFileUpload,
  validateUploadByItemType,
  isKeyOwnedByUser,
  IMAGE_CONSTRAINTS,
  FILE_CONSTRAINTS,
} from "./upload-validation";

// ─── validateImageFile ────────────────────────────────────────

describe("validateImageFile", () => {
  it("accepts all allowed image MIME types", () => {
    for (const mimeType of IMAGE_CONSTRAINTS.mimeTypes) {
      const result = validateImageFile({ type: mimeType, size: 1024 });
      expect(result.ok, `expected ok for ${mimeType}`).toBe(true);
    }
  });

  it("rejects disallowed MIME types", () => {
    const result = validateImageFile({ type: "image/bmp", size: 1024 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/invalid image type/i);
  });

  it("rejects non-image MIME types", () => {
    const result = validateImageFile({ type: "application/pdf", size: 1024 });
    expect(result.ok).toBe(false);
  });

  it("accepts a file at exactly the size limit", () => {
    const result = validateImageFile({
      type: "image/png",
      size: IMAGE_CONSTRAINTS.maxSize,
    });
    expect(result.ok).toBe(true);
  });

  it("rejects a file one byte over the size limit", () => {
    const result = validateImageFile({
      type: "image/png",
      size: IMAGE_CONSTRAINTS.maxSize + 1,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/5 mb/i);
  });
});

// ─── validateFileUpload ───────────────────────────────────────

describe("validateFileUpload", () => {
  it("accepts all allowed file MIME types", () => {
    for (const mimeType of FILE_CONSTRAINTS.mimeTypes) {
      const result = validateFileUpload({ type: mimeType, size: 1024 });
      expect(result.ok, `expected ok for ${mimeType}`).toBe(true);
    }
  });

  it("rejects image MIME types (not allowed for file type)", () => {
    const result = validateFileUpload({ type: "image/png", size: 1024 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/invalid file type/i);
  });

  it("accepts a file at exactly the size limit", () => {
    const result = validateFileUpload({
      type: "application/pdf",
      size: FILE_CONSTRAINTS.maxSize,
    });
    expect(result.ok).toBe(true);
  });

  it("rejects a file one byte over the size limit", () => {
    const result = validateFileUpload({
      type: "application/pdf",
      size: FILE_CONSTRAINTS.maxSize + 1,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/10 mb/i);
  });
});

// ─── validateUploadByItemType ─────────────────────────────────

describe("validateUploadByItemType", () => {
  it("routes 'image' to image validation", () => {
    const result = validateUploadByItemType("image", {
      type: "image/png",
      size: 1024,
    });
    expect(result.ok).toBe(true);
  });

  it("routes 'Image' (case-insensitive) to image validation", () => {
    const result = validateUploadByItemType("Image", {
      type: "image/webp",
      size: 1024,
    });
    expect(result.ok).toBe(true);
  });

  it("routes 'file' to file validation", () => {
    const result = validateUploadByItemType("file", {
      type: "application/json",
      size: 1024,
    });
    expect(result.ok).toBe(true);
  });

  it("routes 'File' (case-insensitive) to file validation", () => {
    const result = validateUploadByItemType("File", {
      type: "text/plain",
      size: 1024,
    });
    expect(result.ok).toBe(true);
  });

  it("rejects unsupported item type names", () => {
    const result = validateUploadByItemType("snippet", {
      type: "text/plain",
      size: 1024,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/unsupported/i);
  });

  it("rejects wrong MIME type for item type (image file uploaded to file slot)", () => {
    const result = validateUploadByItemType("file", {
      type: "image/png",
      size: 1024,
    });
    expect(result.ok).toBe(false);
  });
});

// ─── isKeyOwnedByUser ─────────────────────────────────────────

describe("isKeyOwnedByUser", () => {
  it("returns true for a key belonging to the user", () => {
    expect(isKeyOwnedByUser("uploads/user-123/abc.png", "user-123")).toBe(true);
  });

  it("returns false for a key belonging to a different user", () => {
    expect(isKeyOwnedByUser("uploads/user-456/abc.png", "user-123")).toBe(false);
  });

  it("returns false for a key that does not start with uploads/", () => {
    expect(isKeyOwnedByUser("user-123/abc.png", "user-123")).toBe(false);
  });

  it("returns false for an empty key", () => {
    expect(isKeyOwnedByUser("", "user-123")).toBe(false);
  });

  it("does not allow prefix-matching a longer userId", () => {
    // "user-1" should NOT match a key owned by "user-123"
    expect(isKeyOwnedByUser("uploads/user-123/abc.png", "user-1")).toBe(false);
  });
});
