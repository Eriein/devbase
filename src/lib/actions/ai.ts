"use server";

import { requireSession } from "@/lib/actions/guards";
import { openai, AI_MODEL } from "@/lib/openai";
import { ratelimit, withRateLimit } from "@/lib/rate-limit";
import { canUseAI } from "@/lib/usage-limits";
import {
  validateAutoTagsInput,
  buildTagPromptText,
  parseTagsResponse,
} from "@/lib/ai-tags-validation";
import type { AutoTagsInput } from "@/lib/ai-tags-validation";
import {
  validateAutoDescriptionInput,
  buildDescriptionPromptText,
  parseDescriptionResponse,
} from "@/lib/ai-description-validation";
import type { AutoDescriptionInput } from "@/lib/ai-description-validation";
import {
  validateExplainCodeInput,
  buildExplainPromptText,
  parseExplanationResponse,
} from "@/lib/ai-explain-validation";
import type { ExplainCodeInput } from "@/lib/ai-explain-validation";
import {
  validateOptimizePromptInput,
  buildOptimizePromptText,
  parseOptimizeResponse,
} from "@/lib/ai-optimize-validation";
import type { OptimizePromptInput } from "@/lib/ai-optimize-validation";

// ─── Helper: runAIAction ──────────────────────────────────────
//
// Collapses the shared shape of every AI action behind one function:
// auth → Pro gate → validate → rate-limited OpenAI call → parse → mapped result.
// The four exported actions below become thin config wrappers.

type AIRequest = {
  instructions: string;
  input: string;
  text?: { format: { type: "json_object" } };
};

type AIActionResult<TKey extends string, TValue> =
  | ({ success: true } & { [P in TKey]: TValue })
  | { success: false; error: string; minutesUntilReset?: number };

async function runAIAction<
  TData,
  TValue extends { length: number },
  TKey extends string,
>(
  input: unknown,
  cfg: {
    validate: (
      i: unknown
    ) => { ok: true; data: TData } | { ok: false; error: string };
    buildRequest: (data: TData) => AIRequest;
    parse: (text: string) => TValue;
    resultKey: TKey;
    emptyError: string;
    failureError: string;
  }
): Promise<AIActionResult<TKey, TValue>> {
  const s = await requireSession();
  if (!s.ok) return { success: false, error: s.error };

  if (!canUseAI(s.isPro)) {
    return { success: false, error: "AI features require a Pro subscription" };
  }

  const validation = cfg.validate(input);
  if (!validation.ok) return { success: false, error: validation.error };

  try {
    const result = await withRateLimit(ratelimit.ai, s.userId, async () => {
      const req = cfg.buildRequest(validation.data);

      const response = await openai.responses.create({
        model: AI_MODEL,
        instructions: req.instructions,
        input: req.input,
        ...(req.text && { text: req.text }),
      });

      const value = cfg.parse(response.output_text);
      if (value.length === 0) {
        return { success: false as const, error: cfg.emptyError };
      }

      return {
        success: true as const,
        [cfg.resultKey]: value,
      } as { success: true } & { [P in TKey]: TValue };
    });

    if ("minutesUntilReset" in result) {
      return {
        success: false,
        error: result.error,
        minutesUntilReset: result.minutesUntilReset,
      };
    }

    return result;
  } catch {
    return { success: false, error: cfg.failureError };
  }
}

// ─── generateAutoTags ─────────────────────────────────────────

export type GenerateAutoTagsResult =
  | { success: true; tags: string[] }
  | { success: false; error: string; minutesUntilReset?: number };

export async function generateAutoTags(
  input: AutoTagsInput
): Promise<GenerateAutoTagsResult> {
  return runAIAction(input, {
    validate: validateAutoTagsInput,
    buildRequest: (data) => ({
      instructions:
        'You are a developer tool assistant. Given a code snippet, note, or other developer content, suggest 3-5 concise, relevant tags. Return a JSON object with a "tags" array of lowercase strings. Only return the JSON, nothing else.',
      input: `Suggest 3-5 tags for this item. Return JSON only.\n\n${buildTagPromptText(data)}`,
      text: { format: { type: "json_object" } },
    }),
    parse: parseTagsResponse,
    resultKey: "tags",
    emptyError: "AI returned no tags. Try again or add more content.",
    failureError: "Failed to generate tags. Please try again.",
  });
}

// ─── generateAutoDescription ─────────────────────────────────

export type GenerateAutoDescriptionResult =
  | { success: true; description: string }
  | { success: false; error: string; minutesUntilReset?: number };

export async function generateAutoDescription(
  input: AutoDescriptionInput
): Promise<GenerateAutoDescriptionResult> {
  return runAIAction(input, {
    validate: validateAutoDescriptionInput,
    buildRequest: (data) => ({
      instructions:
        'You are a developer tool assistant. Given a developer item (snippet, prompt, command, note, link, file, or image), write an informative, concise description of exactly 1 to 2 sentences. Be specific about what the item is or does. No markdown, no quotes, no leading phrases like "This is" or "Description:". Return only the description text.',
      input: `Write a 1-2 sentence description for this item.\n\n${buildDescriptionPromptText(data)}`,
    }),
    parse: parseDescriptionResponse,
    resultKey: "description",
    emptyError: "AI returned no description. Try again or add more content.",
    failureError: "Failed to generate description. Please try again.",
  });
}

// ─── explainCode ─────────────────────────────────────────────

export type ExplainCodeResult =
  | { success: true; explanation: string }
  | { success: false; error: string; minutesUntilReset?: number };

export async function explainCode(
  input: ExplainCodeInput
): Promise<ExplainCodeResult> {
  return runAIAction(input, {
    validate: validateExplainCodeInput,
    buildRequest: (data) => ({
      instructions:
        'You are a developer tool assistant. Given a code snippet or terminal command, write a concise 200-300 word explanation in markdown. Cover what the code does and the key concepts, functions, or flags involved. Use short paragraphs and inline code formatting where appropriate. Do not wrap your response in a fenced code block and do not start with "Explanation:". Return only the markdown explanation.',
      input: `Explain this ${data.itemTypeName.toLowerCase()} in 200-300 words of markdown.\n\n${buildExplainPromptText(data)}`,
    }),
    parse: parseExplanationResponse,
    resultKey: "explanation",
    emptyError: "AI returned no explanation. Try again.",
    failureError: "Failed to generate explanation. Please try again.",
  });
}

// ─── optimizePrompt ───────────────────────────────────────────

export type OptimizePromptResult =
  | { success: true; optimizedPrompt: string }
  | { success: false; error: string; minutesUntilReset?: number };

export async function optimizePrompt(
  input: OptimizePromptInput
): Promise<OptimizePromptResult> {
  return runAIAction(input, {
    validate: validateOptimizePromptInput,
    buildRequest: (data) => ({
      instructions:
        "You are a prompt refinement assistant. Improve the user's prompt by adding specific details, context, and structure where needed. Make it more clear and actionable. If the prompt is already good, return it unchanged. Return ONLY the optimized prompt text, no commentary, no labels like 'Optimized:', no code blocks.",
      input: `Improve this prompt:\n\n${buildOptimizePromptText(data)}`,
    }),
    parse: parseOptimizeResponse,
    resultKey: "optimizedPrompt",
    emptyError: "AI returned an empty response. Try again.",
    failureError: "Failed to optimize prompt. Please try again.",
  });
}
