import { z } from "zod";

// ─── Constants ───────────────────────────────────────────────

export const MAX_CONTENT_LENGTH = 2000;
export const OPTIMIZE_ITEM_TYPE = "prompt";

// ─── Input schema ────────────────────────────────────────────

export const optimizePromptInputSchema = z
  .object({
    title: z.string().optional().nullable(),
    content: z.string().min(1, "Content is required"),
    itemTypeName: z.string().min(1, "Item type is required"),
    itemId: z.string().min(1, "Item ID is required"),
  })
  .superRefine((data, ctx) => {
    const normalized = data.itemTypeName.toLowerCase();
    if (normalized !== OPTIMIZE_ITEM_TYPE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Optimize is only available for prompt items",
        path: ["itemTypeName"],
      });
    }
    if (!data.content || data.content.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Content is required",
        path: ["content"],
      });
    }
  });

export type OptimizePromptInput = z.infer<typeof optimizePromptInputSchema>;

// ─── Validation ──────────────────────────────────────────────

export function validateOptimizePromptInput(
  input: unknown
): { ok: true; data: OptimizePromptInput } | { ok: false; error: string } {
  const result = optimizePromptInputSchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      error: result.error.issues[0]?.message ?? "Invalid input",
    };
  }
  return { ok: true, data: result.data };
}

// ─── Pure helpers ────────────────────────────────────────────

function trimOrNull(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Build the prompt text sent to the model.
 *
 * The instructions guide the model to make meaningful improvements to vague prompts:
 * - Add specific context, constraints, or details where missing
 * - Clarify ambiguous terms
 * - Add structure with sections/steps if applicable
 * - Specify output format when relevant
 * - DO NOT change the core task or add requirements the user didn't imply
 */
export function buildOptimizePromptText(input: OptimizePromptInput): string {
  const parts: string[] = [
    "You are a prompt refinement assistant. Your goal is to make prompts more specific, clear, and actionable.",
    "",
    "Guidelines for improvement:",
    "- Add specific details, context, or constraints the user implied but didn't state",
    "- Clarify ambiguous terms (e.g., 'simple' → specify what's needed)",
    "- Add structure (numbered steps, sections, or format specs) where helpful",
    "- Specify output format if relevant (code, explanation, list, etc.)",
    "- Add relevant technical details the task likely needs",
    "",
    "DO NOT:",
    "- Add new requirements the user didn't ask for",
    "- Change the core task or goal",
    "- Make assumptions beyond what the original prompt implies",
    "- Over-specify to the point of changing the request",
    "",
    "If the prompt is already clear and complete, return it as-is.",
    "",
  ];

  const title = trimOrNull(input.title);
  if (title) parts.push(`Title: ${title}`);

  const content = input.content;
  const truncated =
    content.length > MAX_CONTENT_LENGTH
      ? content.slice(0, MAX_CONTENT_LENGTH) + "..."
      : content;
  parts.push(`Original prompt:\n${truncated}`);

  return parts.join("\n");
}

/**
 * Normalize the raw model response into clean prompt text.
 *
 * Handles:
 * - {"optimized": "..."} or {"prompt": "..."} JSON wrappers
 * - A surrounding fenced code block (```...```)
 * - A leading "Optimized:" / "Optimized prompt:" label
 * - Surrounding quotes (straight, curly, or backtick)
 * - Any surrounding whitespace
 *
 * Returns the improved prompt verbatim — no transformation, no sentence capping.
 */
export function parseOptimizeResponse(text: unknown): string {
  if (typeof text !== "string") return "";

  let out = text.trim();
  if (out.length === 0) return "";

  // The model sometimes returns JSON like {"optimized": "..."} or {"prompt": "..."}.
  if (out.startsWith("{")) {
    try {
      const parsed = JSON.parse(out);
      if (parsed && typeof parsed.optimized === "string") {
        out = parsed.optimized.trim();
      } else if (parsed && typeof parsed.prompt === "string") {
        out = parsed.prompt.trim();
      }
    } catch {
      // Not JSON — fall through.
    }
  }

  // Strip a surrounding fenced code block (``` or ```markdown ... ```).
  const fenceMatch = out.match(/^```[a-zA-Z]*\s*\n?([\s\S]*?)\n?```\s*$/);
  if (fenceMatch && fenceMatch[1] !== undefined) {
    out = fenceMatch[1].trim();
  }

  // Remove a leading "Optimized:" / "Optimized prompt:" label if present.
  out = out.replace(/^optimized\s*(prompt)?\s*[:\-]\s*/i, "").trim();

  // Strip surrounding quotes (straight, curly, or backtick).
  if (
    (out.startsWith('"') && out.endsWith('"')) ||
    (out.startsWith("'") && out.endsWith("'")) ||
    (out.startsWith("`") && out.endsWith("`")) ||
    (out.startsWith("\u201c") && out.endsWith("\u201d")) || // curly double
    (out.startsWith("\u2018") && out.endsWith("\u2019")) // curly single
  ) {
    out = out.slice(1, -1).trim();
  }

  return out;
}