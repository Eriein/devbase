import { z } from "zod";
import { trimOrNull } from "./utils";
import { AI_MAX_CONTENT_LENGTH } from "./constants";

// ─── Constants ───────────────────────────────────────────────

export const MAX_SENTENCES = 2;

// ─── Input schema ────────────────────────────────────────────

export const autoDescriptionInputSchema = z
  .object({
    title: z.string().optional().nullable(),
    content: z.string().optional().nullable(),
    url: z.string().optional().nullable(),
    language: z.string().optional().nullable(),
    fileName: z.string().optional().nullable(),
    itemTypeName: z.string().min(1, "Item type is required"),
  })
  .superRefine((data, ctx) => {
    // At least one signal field must be present, otherwise there is nothing
    // for the model to summarize.
    const hasSignal =
      (data.title && data.title.trim().length > 0) ||
      (data.content && data.content.trim().length > 0) ||
      (data.url && data.url.trim().length > 0) ||
      (data.fileName && data.fileName.trim().length > 0);
    if (!hasSignal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add a title, content, URL, or file before generating a description",
      });
    }
  });

export type AutoDescriptionInput = z.infer<typeof autoDescriptionInputSchema>;

// ─── Validation ──────────────────────────────────────────────

export function validateAutoDescriptionInput(
  input: unknown
): { ok: true; data: AutoDescriptionInput } | { ok: false; error: string } {
  const result = autoDescriptionInputSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      error: result.error.issues[0]?.message ?? "Invalid input",
    };
  }
  return { ok: true, data: result.data };
}

// ─── Pure helpers ────────────────────────────────────────────

/**
 * Build the prompt text from whatever item fields are available. The item
 * type name is always included so the model can tailor its phrasing.
 * Content is truncated to AI_MAX_CONTENT_LENGTH characters.
 */
export function buildDescriptionPromptText(input: AutoDescriptionInput): string {
  const parts: string[] = [`Type: ${input.itemTypeName}`];

  const title = trimOrNull(input.title);
  if (title) parts.push(`Title: ${title}`);

  const language = trimOrNull(input.language);
  if (language) parts.push(`Language: ${language}`);

  const url = trimOrNull(input.url);
  if (url) parts.push(`URL: ${url}`);

  const fileName = trimOrNull(input.fileName);
  if (fileName) parts.push(`File: ${fileName}`);

  const content = trimOrNull(input.content);
  if (content) {
    const truncated =
      content.length > AI_MAX_CONTENT_LENGTH
        ? content.slice(0, AI_MAX_CONTENT_LENGTH) + "..."
        : content;
    parts.push(`Content: ${truncated}`);
  }

  return parts.join("\n");
}

/**
 * Normalize the raw model response into a clean 1–2 sentence description.
 * Strips surrounding quotes, removes common prefixes, trims whitespace, and
 * caps at MAX_SENTENCES sentences.
 */
export function parseDescriptionResponse(text: string): string {
  if (typeof text !== "string") return "";

  let out = text.trim();
  if (out.length === 0) return "";

  // The model sometimes returns JSON like {"description": "..."}; try parsing.
  if (out.startsWith("{")) {
    try {
      const parsed = JSON.parse(out);
      if (parsed && typeof parsed.description === "string") {
        out = parsed.description.trim();
      }
    } catch {
      // Not JSON — fall through and treat the raw text as the description.
    }
  }

  // Strip matching surrounding quotes (straight or curly).
  const quotePairs: Array<[string, string]> = [
    ['"', '"'],
    ["'", "'"],
    ["\u201C", "\u201D"],
    ["\u2018", "\u2019"],
    ["`", "`"],
  ];
  for (const [open, close] of quotePairs) {
    if (out.length >= 2 && out.startsWith(open) && out.endsWith(close)) {
      out = out.slice(1, -1).trim();
      break;
    }
  }

  // Remove a leading "Description:" label if the model added one.
  out = out.replace(/^description\s*[:\-]\s*/i, "").trim();

  // Cap at MAX_SENTENCES sentences. A "sentence" ends in . ! or ?, optionally
  // followed by a closing quote or bracket. This is good enough for short
  // model output — we're not trying to handle abbreviations rigorously.
  const sentenceMatches = out.match(/[^.!?]+[.!?]+["'\u201D\u2019\)\]]*\s*/g);
  if (sentenceMatches && sentenceMatches.length > MAX_SENTENCES) {
    out = sentenceMatches.slice(0, MAX_SENTENCES).join("").trim();
  }

  return out;
}
