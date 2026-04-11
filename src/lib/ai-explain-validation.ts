import { z } from "zod";
import { trimOrNull } from "./utils";
import { AI_MAX_CONTENT_LENGTH } from "./constants";

// ─── Constants ───────────────────────────────────────────────

export const EXPLAIN_ITEM_TYPES = ["snippet", "command"] as const;
export type ExplainItemType = (typeof EXPLAIN_ITEM_TYPES)[number];

// ─── Input schema ────────────────────────────────────────────

export const explainCodeInputSchema = z
  .object({
    title: z.string().optional().nullable(),
    content: z.string().min(1, "Content is required"),
    language: z.string().optional().nullable(),
    itemTypeName: z.string().min(1, "Item type is required"),
  })
  .superRefine((data, ctx) => {
    const normalized = data.itemTypeName.toLowerCase();
    if (!EXPLAIN_ITEM_TYPES.includes(normalized as ExplainItemType)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Explain is only available for snippet and command items",
        path: ["itemTypeName"],
      });
    }
    if (data.content.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Content is required",
        path: ["content"],
      });
    }
  });

export type ExplainCodeInput = z.infer<typeof explainCodeInputSchema>;

// ─── Validation ──────────────────────────────────────────────

export function validateExplainCodeInput(
  input: unknown
): { ok: true; data: ExplainCodeInput } | { ok: false; error: string } {
  const result = explainCodeInputSchema.safeParse(input);
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
 * Build the prompt text sent to the model. The type, language, and (optional)
 * title frame the context; the content is the thing we want explained. Content
 * is truncated to AI_MAX_CONTENT_LENGTH characters to keep token usage bounded.
 */
export function buildExplainPromptText(input: ExplainCodeInput): string {
  const parts: string[] = [`Type: ${input.itemTypeName.toLowerCase()}`];

  const language = trimOrNull(input.language);
  if (language) parts.push(`Language: ${language}`);

  const title = trimOrNull(input.title);
  if (title) parts.push(`Title: ${title}`);

  const content = input.content;
  const truncated =
    content.length > AI_MAX_CONTENT_LENGTH
      ? content.slice(0, AI_MAX_CONTENT_LENGTH) + "..."
      : content;
  parts.push(`Content:\n${truncated}`);

  return parts.join("\n");
}

/**
 * Normalize the raw model response into clean explanation markdown.
 *
 * Handles:
 *  - {"explanation": "..."} JSON wrappers
 *  - A leading "Explanation:" / "Explanation -" label
 *  - A surrounding fenced code block (```markdown ... ``` or bare ```)
 *  - Surrounding whitespace
 *
 * Unlike parseDescriptionResponse, this does NOT cap sentences — explanations
 * are intentionally multi-sentence markdown.
 */
export function parseExplanationResponse(text: string): string {
  if (typeof text !== "string") return "";

  let out = text.trim();
  if (out.length === 0) return "";

  // The model sometimes returns JSON like {"explanation": "..."}.
  if (out.startsWith("{")) {
    try {
      const parsed = JSON.parse(out);
      if (parsed && typeof parsed.explanation === "string") {
        out = parsed.explanation.trim();
      }
    } catch {
      // Not JSON — fall through.
    }
  }

  // Strip a surrounding fenced code block (``` or ```markdown ... ```).
  const fenceMatch = out.match(/^```(?:[a-zA-Z]+)?\s*\n([\s\S]*?)\n```\s*$/);
  if (fenceMatch && fenceMatch[1] !== undefined) {
    out = fenceMatch[1].trim();
  }

  // Remove a leading "Explanation:" / "Explanation -" label if present.
  out = out.replace(/^explanation\s*[:\-]\s*/i, "").trim();

  return out;
}
