// Pure file upload validation — no side effects

export const IMAGE_CONSTRAINTS = {
  maxSize: 5 * 1024 * 1024,
  mimeTypes: [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ] as const,
  accept: ".png,.jpg,.jpeg,.gif,.webp,.svg",
} as const;

export const FILE_CONSTRAINTS = {
  maxSize: 10 * 1024 * 1024,
  mimeTypes: [
    "application/pdf",
    "text/plain",
    "text/markdown",
    "application/json",
    "application/x-yaml",
    "text/yaml",
    "application/xml",
    "text/xml",
    "text/csv",
    "application/toml",
  ] as const,
  accept: ".pdf,.txt,.md,.json,.yaml,.yml,.xml,.csv,.toml,.ini",
} as const;

type FileValidationResult = { ok: true } | { ok: false; error: string };

export function validateImageFile(file: {
  type: string;
  size: number;
}): FileValidationResult {
  const allowed: readonly string[] = IMAGE_CONSTRAINTS.mimeTypes;
  if (!allowed.includes(file.type)) {
    return {
      ok: false,
      error: "Invalid image type. Allowed: PNG, JPG, GIF, WebP, SVG",
    };
  }
  if (file.size > IMAGE_CONSTRAINTS.maxSize) {
    return { ok: false, error: "Image must be 5 MB or smaller" };
  }
  return { ok: true };
}

export function validateFileUpload(file: {
  type: string;
  size: number;
}): FileValidationResult {
  const allowed: readonly string[] = FILE_CONSTRAINTS.mimeTypes;
  if (!allowed.includes(file.type)) {
    return {
      ok: false,
      error: "Invalid file type. Allowed: PDF, TXT, MD, JSON, YAML, XML, CSV, TOML, INI",
    };
  }
  if (file.size > FILE_CONSTRAINTS.maxSize) {
    return { ok: false, error: "File must be 10 MB or smaller" };
  }
  return { ok: true };
}

export function validateUploadByItemType(
  itemTypeName: string,
  file: { type: string; size: number }
): FileValidationResult {
  if (itemTypeName.toLowerCase() === "image") {
    return validateImageFile(file);
  }
  if (itemTypeName.toLowerCase() === "file") {
    return validateFileUpload(file);
  }
  return { ok: false, error: "Unsupported item type for file upload" };
}

/** Pure: checks that a given R2 key belongs to the requesting user */
export function isKeyOwnedByUser(key: string, userId: string): boolean {
  return key.startsWith(`uploads/${userId}/`);
}
