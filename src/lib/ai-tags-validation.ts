import { z } from "zod";

// ─── Constants ───────────────────────────────────────────────

export const MAX_CONTENT_LENGTH = 2000;
export const MIN_TAGS = 1;
export const MAX_TAGS = 5;

// ─── Input schema ────────────────────────────────────────────

export const autoTagsInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export type AutoTagsInput = z.infer<typeof autoTagsInputSchema>;

// ─── Validation ──────────────────────────────────────────────

export function validateAutoTagsInput(
  input: unknown
): { ok: true; data: AutoTagsInput } | { ok: false; error: string } {
  const result = autoTagsInputSchema.safeParse(input);
  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message ?? "Invalid input" };
  }
  return { ok: true, data: result.data };
}

// ─── Pure helpers ────────────────────────────────────────────

/** Build the prompt text from item fields, truncating content to MAX_CONTENT_LENGTH */
export function buildTagPromptText(input: AutoTagsInput): string {
  const parts: string[] = [`Title: ${input.title}`];
  if (input.description) {
    parts.push(`Description: ${input.description}`);
  }
  if (input.content) {
    const truncated =
      input.content.length > MAX_CONTENT_LENGTH
        ? input.content.slice(0, MAX_CONTENT_LENGTH) + "..."
        : input.content;
    parts.push(`Content: ${truncated}`);
  }
  return parts.join("\n");
}

/** Parse the AI response text into a normalized tag array. Handles both {"tags": [...]} and bare [...] formats. */
export function parseTagsResponse(text: string): string[] {
  try {
    const parsed = JSON.parse(text);

    let rawTags: unknown[];
    if (Array.isArray(parsed)) {
      rawTags = parsed;
    } else if (parsed && Array.isArray(parsed.tags)) {
      rawTags = parsed.tags;
    } else {
      return [];
    }

    return rawTags
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0)
      .slice(0, MAX_TAGS);
  } catch {
    return [];
  }
}
